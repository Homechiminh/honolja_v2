import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // 🔴 useLocation 제거
import { supabase } from '../supabase';
import { Region } from '../types'; // 🔴 CategoryType, LEVEL_NAMES 제거
import type { Store } from '../types';
import StoreCard from '../components/StoreCard';

interface StoreListProps {
  forcedRegion?: Region; 
}

const StoreList: React.FC<StoreListProps> = ({ forcedRegion }) => {
  const { category } = useParams<{ category: string }>();
  // 🔴 const location = useLocation(); 삭제됨
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. 현재 지역 결정 (forcedRegion이 있으면 해당 지역, 없으면 기본 호치민)
  const currentRegion = forcedRegion || Region.HCMC;

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      
      // 2. 지역별 데이터 필터링
      let query = supabase
        .from('stores')
        .select('*')
        .eq('region', currentRegion); 

      // 3. 카테고리가 있을 경우 추가 필터링
      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (!error && data) {
        setStores(data as Store[]);
      }
      setLoading(false);
    };

    fetchStores();
  }, [category, currentRegion]);

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
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
            Fetching Stores in {currentRegion}...
          </div>
        ) : stores.length === 0 ? (
          <div className="py-20 text-center bg-[#111] rounded-[3rem] border border-dashed border-white/10">
            <p className="text-gray-600 font-black italic uppercase">해당 지역에 등록된 업소가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreList;
