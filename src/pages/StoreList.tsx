import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { Region } from '../types'; 
import type { Store } from '../types';
import StoreCard from '../components/StoreCard';
import { useAuth } from '../contexts/AuthContext'; 
import { useFetchGuard } from '../hooks/useFetchGuard'; 

interface StoreListProps {
  forcedRegion?: Region; 
}

const ITEMS_PER_PAGE = 9; 

const StoreList: React.FC<StoreListProps> = ({ forcedRegion }) => {
  const { category } = useParams<{ category: string }>();
  const { loading: authLoading } = useAuth(); 
  
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const currentRegion = forcedRegion || Region.HCMC;

  // 1. 카테고리나 지역 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [category, currentRegion]);

  /**
   * 🔴 [방탄 fetch] 데이터 호출 로직
   * 406 에러나 네트워크 지연이 발생해도 무조건 로딩을 종료합니다.
   */
  const fetchStores = async () => {
    setLoading(true); // 1. 스피너 가동
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('stores')
        .select('*', { count: 'exact' })
        .eq('region', currentRegion); 

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      // 쿼리 실행
      const { data, error, count } = await query
        .order('is_hot', { ascending: false }) 
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        // 🔴 서버 거절(406) 등의 에러 발생 시 즉시 catch로 던짐
        throw error;
      }

      if (data) {
        setStores(data as Store[]);
        if (count !== null) setTotalCount(count);
      }
    } catch (err: any) {
      console.error('Store Archive Sync Error (406 등):', err.message);
      // 에러 시 기존 데이터를 비워주어 잘못된 정보 노출 방지
      setStores([]); 
    } finally {
      // 🔴 2. [필살기] 성공/실패 여부와 상관없이 무조건 스피너 정지
      setLoading(false);
    }
  };

  // 🔴 데이터 가드 적용 (인증 완료 후 최적의 타이밍에 호출)
  useFetchGuard(fetchStores, [category, currentRegion, currentPage]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // 3. 전역 인증 확인 중일 때 (블랙아웃 방지)
  if (authLoading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans selection:bg-red-600/30">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 border-l-4 border-red-600 pl-6">
          <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
            {currentRegion} 
            <span className="text-red-600 ml-4">
              {category ? category.replace('_', ' ').toUpperCase() : 'PREMIUM LIST'}
            </span>
          </h2>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-4 italic">
            {currentRegion} 지역의 엄선된 최고의 업소들을 만나보세요.
          </p>
        </header>

        {loading ? (
          // 리스트 전용 로딩 UI (디자인 일관성 유지)
          <div className="py-40 text-center">
            <div className="inline-block w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-black italic uppercase tracking-widest text-xs">Syncing Store Database...</p>
          </div>
        ) : stores.length === 0 ? (
          <div className="py-32 text-center bg-[#111] rounded-[3.5rem] border border-dashed border-white/5 animate-in fade-in duration-500">
            <span className="text-5xl mb-6 block">🏙️</span>
            <p className="text-gray-500 font-black italic uppercase tracking-widest">해당 조건의 업소가 아직 등록되지 않았습니다.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 animate-in fade-in duration-700">
              {stores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>

            {/* 페이지네이션 UI */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-20">
                <button
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage(prev => prev - 1);
                    window.scrollTo(0, 0);
                  }}
                  className="px-6 py-3 rounded-2xl border border-white/5 bg-white/5 text-gray-400 font-black text-xs uppercase italic hover:bg-white/10 disabled:opacity-20 transition-all shadow-xl"
                >
                  PREV
                </button>
                
                <div className="flex gap-2 mx-4">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setCurrentPage(pageNum);
                          window.scrollTo(0, 0);
                        }}
                        className={`w-12 h-12 rounded-2xl font-black italic transition-all border-2 ${
                          currentPage === pageNum 
                          ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30 scale-110' 
                          : 'bg-[#111] border-white/5 text-gray-600 hover:text-white hover:border-white/20'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage(prev => prev + 1);
                    window.scrollTo(0, 0);
                  }}
                  className="px-6 py-3 rounded-2xl border border-white/5 bg-white/5 text-gray-400 font-black text-xs uppercase italic hover:bg-white/10 disabled:opacity-20 transition-all shadow-xl"
                >
                  NEXT
                </button>
              </div>
            )}
            
            <div className="mt-12 text-center">
               <p className="text-[10px] text-gray-700 font-black uppercase italic tracking-widest opacity-50">
                 Total {totalCount} premium stores found in {currentRegion} sector
               </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StoreList;
