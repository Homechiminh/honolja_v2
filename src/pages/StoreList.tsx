import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; // SEO용 추가
import { supabase } from '../supabase';
import { Region } from '../types'; 
import type { Store } from '../types';
import StoreCard from '../components/StoreCard';
import { useAuth } from '../contexts/AuthContext'; 

interface StoreListProps {
  forcedRegion?: Region; 
}

const ITEMS_PER_PAGE = 9; 

const StoreList: React.FC<StoreListProps> = ({ forcedRegion }) => {
  const { category } = useParams<{ category: string }>();
  const { initialized } = useAuth(); // authLoading 대신 initialized 사용
  
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const currentRegion = forcedRegion || Region.HCMC;

  useEffect(() => {
    setCurrentPage(1);
  }, [category, currentRegion]);

  /**
   * 🔴 카테고리 명칭 변환 함수
   */
  const getCategoryDisplay = (cat: string | undefined) => {
    if (!cat || cat === 'all') return 'PREMIUM LIST';
    if (cat === 'villa') return '숙소 / 풀빌라';
    return cat.replace('_', ' ').toUpperCase();
  };

  /**
   * 🔴 SEO용 카테고리 한글 명칭
   */
  const getCategoryKR = (cat: string | undefined) => {
    if (!cat || cat === 'all') return '전체 업소';
    if (cat === 'massage') return '마사지 스파';
    if (cat === 'barber') return '이발소';
    if (cat === 'karaoke') return '가라오케';
    if (cat === 'barclub') return '바 클럽';
    if (cat === 'villa') return '풀빌라 숙소';
    return cat;
  };

  const fetchStores = async () => {
    setLoading(true);
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('stores')
        .select('*', { count: 'exact' })
        .eq('region', currentRegion); 

      // 필터링 로직 유지
      if (category && category !== 'all') {
        query = query.eq('category', category);
      } else if (category === 'all') {
        query = query.not('category', 'in', '("villa", "car", "guide")');
      }

      const { data, error, count } = await query
        .order('is_hot', { ascending: false }) 
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (data) {
        setStores(data as Store[]);
        if (count !== null) setTotalCount(count);
      }
    } catch (err: any) {
      console.error('Store Sync Error:', err.message);
      setStores([]); 
    } finally {
      setLoading(false);
    }
  };

  // 🔴 useFetchGuard를 제거하고 useEffect로 직접 호출 (비로그인 접근 허용 핵심)
  useEffect(() => {
    if (initialized) {
      fetchStores();
    }
  }, [initialized, category, currentRegion, currentPage]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // 초기화 중일 때만 로딩 표시
  if (!initialized) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans selection:bg-red-600/30">
      {/* 🔴 SEO 최적화 메타 태그 */}
      <Helmet>
        <title>호놀자 | {currentRegion} {getCategoryKR(category)} - 호치민 여행 정보</title>
        <meta name="description" content={`${currentRegion} 지역 ${getCategoryKR(category)}의 실시간 정보와 검증된 업장 정보를 확인하세요. 베트남 호치민 밤문화 & 관광 No.1 가이드.`} />
        <meta name="keywords" content={`베트남여행, 호치민여행, ${currentRegion}여행, 호치민 밤문화, 호치민 유흥, 호치민 ${getCategoryKR(category)}, 호치민 관광, 호치민 커뮤니티`} />
        <meta property="og:title" content={`호놀자 | ${currentRegion} ${getCategoryKR(category)}`} />
        <meta property="og:description" content="남성들을 위한 베트남 호치민 프리미엄 가이드" />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <header className="mb-12 border-l-4 border-red-600 pl-6">
          <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
            {currentRegion} 
            <span className="text-red-600 ml-4">
              {getCategoryDisplay(category)}
            </span>
          </h2>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-4 italic">
            {currentRegion} 지역의 검증된 프리미엄 정보입니다.
          </p>
        </header>

        {loading ? (
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
