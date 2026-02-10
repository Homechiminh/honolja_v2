import React, { useEffect, useState } from 'react';
import MillMap from '../components/MillMap';
import { supabase } from '../supabase';

const StoreMapPage: React.FC = () => {
  const [allStores, setAllStores] = useState<any[]>([]); 
  const [stores, setStores] = useState<any[]>([]);       
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: '전체', icon: '📍' },
    { id: 'massage', name: '마사지', icon: '💆' },
    { id: 'barber', name: '이발소', icon: '💈' },
    { id: 'karaoke', name: '가라오케', icon: '🎤' },
    { id: 'barclub', name: '바/클럽', icon: '🍸' },
  ];

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('stores').select('*');
        if (error) throw error;

        if (data) {
          const validData = data
            .map((item: any) => ({
              ...item,
              lat: item.lat || item.Lat ? Number(item.lat || item.Lat) : null,
              lng: item.lng || item.Ing || item.Lng ? Number(item.lng || item.Ing || item.Lng) : null
            }))
            .filter(item => item.lat !== null && item.lng !== null && !isNaN(item.lat));

          setAllStores(validData);
          setStores(validData);
        }
      } catch (err) {
        console.error('가게 정보를 불러오는데 실패했습니다:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  useEffect(() => {
    if (activeCategory === 'all') {
      setStores(allStores);
    } else {
      const filtered = allStores.filter(
        (s) => s.category?.toLowerCase().trim() === activeCategory
      );
      setStores(filtered);
    }
  }, [activeCategory, allStores]);

  return (
    // 🚨 bg-[#050505]를 bg-white로 변경하여 지도 가림 현상 해결
    <div className="w-full h-[calc(100vh-80px)] bg-white relative overflow-hidden">
      
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-2xl">
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar justify-start md:justify-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-black uppercase italic whitespace-nowrap transition-all border ${
                activeCategory === cat.id
                  ? 'bg-red-600 border-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]'
                  : 'bg-black/60 border-white/10 text-gray-400 backdrop-blur-md hover:border-white/30'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center text-black font-bold">
          로딩 중...
        </div>
      ) : (
        <div className="w-full h-full">
          <MillMap stores={stores} />
        </div>
      )}
      
      <div className="absolute top-4 left-4 z-10 bg-black/70 p-4 rounded-lg border border-white/10 backdrop-blur-md">
        <h1 className="text-xl font-black text-white italic text-red-600 tracking-tighter uppercase">Honolja Map</h1>
        <p className="text-[10px] text-gray-400 font-bold">검색 결과: {stores.length}개</p>
      </div>
    </div>
  );
};

export default StoreMapPage;
