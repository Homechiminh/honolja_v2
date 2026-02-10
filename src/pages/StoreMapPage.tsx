import React, { useEffect, useState } from 'react';
import MillMap from '../components/MillMap';
import { supabase } from '../supabase';

const StoreMapPage: React.FC = () => {
  const [allStores, setAllStores] = useState<any[]>([]); // 원본 보관용
  const [stores, setStores] = useState<any[]>([]);       // 지도 표시용 (필터링됨)
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // 필터 카테고리 정의
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
        // 1. 전체 데이터를 가져옵니다.
        const { data, error } = await supabase.from('stores').select('*');

        if (error) throw error;

        if (data) {
          // 2. 좌표 데이터 전처리 (오타 및 형식 대응)
          const validData = data
            .map((item: any) => {
              const latVal = item.lat || item.Lat;
              const lngVal = item.lng || item.Ing || item.Lng;

              return {
                ...item,
                lat: latVal ? Number(latVal) : null,
                lng: lngVal ? Number(lngVal) : null
              };
            })
            // 3. 좌표가 확실히 존재하는 것만 1차 필터링
            .filter(item => item.lat !== null && item.lng !== null && !isNaN(item.lat));

          setAllStores(validData);
          setStores(validData); // 초기 상태는 전체 표시
        }
      } catch (err) {
        console.error('가게 정보를 불러오는데 실패했습니다:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  // 4. 카테고리 변경 시 실시간 필터링 로직 (누락되었던 부분)
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
    <div className="w-full h-[calc(100vh-80px)] bg-[#050505] relative overflow-hidden">
      
      {/* 5. 상단 필터 버튼 UI (누락되었던 부분) */}
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
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
        </div>
      ) : (
        <>
          <MillMap stores={stores} />
          
          {stores.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/80 text-white px-8 py-4 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
                <p className="text-sm font-black italic">📍 해당 카테고리에 등록된 업체가 없습니다.</p>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* 왼쪽 상단 타이틀 레이어 */}
      <div className="absolute top-4 left-4 z-10 bg-black/70 p-4 rounded-lg border border-white/10 backdrop-blur-md">
        <h1 className="text-xl font-black text-white italic text-red-600 tracking-tighter uppercase">Honolja Map</h1>
        <p className="text-[10px] text-gray-400 font-bold">검색 결과: {stores.length}개</p>
      </div>
    </div>
  );
};

export default StoreMapPage;
