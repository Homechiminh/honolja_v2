import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { Region } from '../types'; 
import type { Store } from '../types';
import StoreCard from '../components/StoreCard';

interface StoreListProps {
  forcedRegion?: Region; 
}

const ITEMS_PER_PAGE = 9; // 한 페이지에 보여줄 업소 수

const StoreList: React.FC<StoreListProps> = ({ forcedRegion }) => {
  const { category } = useParams<{ category: string }>();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 페이지네이션 상태 추가
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const currentRegion = forcedRegion || Region.HCMC;

  // 카테고리나 지역이 바뀌면 페이지를 1페이지로 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [category, currentRegion]);

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // 1. 데이터 및 전체 개수 쿼리
      let query = supabase
        .from('stores')
        .select('*', { count: 'exact' }) // 전체 개수(exact)를 함께 가져옴
        .eq('region', currentRegion); 

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to); // 🔴 페이지네이션 핵심 로직

      if (!error && data) {
        setStores(data as Store[]);
        if (count !== null) setTotalCount(count);
      }
      setLoading(false);
    };

    fetchStores();
  }, [category, currentRegion, currentPage]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          {/* 디자인 반영 */}
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">
            {currentRegion === Region.HCMC ? 'HCMC' : currentRegion} 
            <span className="text-red-600 ml-3">
              {category ? category.toUpperCase() : 'ALL LIST'}
            </span>
          </h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2 ml-1 italic">
            {currentRegion} 지역의 엄선된 프리미엄 업소 리스트
          </p>
        </header>

        {loading ? (
          <div className="py-20 text-center text-white italic animate-pulse uppercase tracking-widest">
            Fetching Stores...
          </div>
        ) : stores.length === 0 ? (
          <div className="py-20 text-center bg-[#111] rounded-[3rem] border border-dashed border-white/10">
            <p className="text-gray-600 font-black italic uppercase">해당 지역에 등록된 업소가 없습니다.</p>
          </div>
        ) : (
          <>
            {/* 업소 그리드 */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {stores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>

            {/* 🔴 페이지네이션 UI 추가 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="px-6 py-2 rounded-full border border-white/10 text-white font-bold hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  PREV
                </button>
                
                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-full font-black transition-all ${
                        currentPage === i + 1 
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/20 scale-110' 
                        : 'bg-white/5 text-gray-500 hover:text-white'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-6 py-2 rounded-full border border-white/10 text-white font-bold hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  NEXT
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StoreList;
