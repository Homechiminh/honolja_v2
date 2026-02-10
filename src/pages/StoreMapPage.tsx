import React, { useEffect, useState } from 'react';
import MillMap from '../components/MillMap';
import { supabase } from '../supabase';

const StoreMapPage: React.FC = () => {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        
        // 1. 위도/경도가 있는 것만 가져오되, 컬럼명 오타 대응을 위해 유연하게 쿼리
        const { data, error } = await supabase
          .from('stores')
          .select('*');

        if (error) throw error;

        if (data) {
          // 2. DB의 float8 값을 프론트엔드에서 쓸 수 있게 안전하게 변환
          const validData = data
            .map((item: any) => {
              // lng가 소문자 l인지 대문자 I인지 모르므로 둘 다 체크
              const latVal = item.lat || item.Lat;
              const lngVal = item.lng || item.Ing || item.Lng;

              return {
                ...item,
                lat: latVal ? Number(latVal) : null,
                lng: lngVal ? Number(lngVal) : null
              };
            })
            // 3. 변환 후 위도, 경도가 확실히 숫자로 존재하는 데이터만 최종 필터링
            .filter(item => item.lat !== null && item.lng !== null && !isNaN(item.lat));

          console.log("지도에 표시될 유효 데이터:", validData);
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

  return (
    <div className="w-full h-[calc(100vh-80px)] bg-[#050505] relative">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
        </div>
      ) : (
        <>
          {/* 필터링된 stores를 MillMap에 전달 */}
          <MillMap stores={stores} />
          
          {stores.length === 0 && (
            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 bg-red-600/90 text-white px-6 py-2 rounded-full font-black shadow-xl">
              📍 표시 가능한 데이터가 없습니다 (데이터 확인 필요)
            </div>
          )}
        </>
      )}
      
      <div className="absolute top-4 left-4 z-10 bg-black/70 p-4 rounded-lg border border-white/10 backdrop-blur-md">
        <h1 className="text-xl font-black text-white italic text-red-600 tracking-tighter uppercase">Honolja Map</h1>
        <p className="text-[10px] text-gray-400 font-bold">검색된 마커: {stores.length}개</p>
      </div>
    </div>
  );
};

export default StoreMapPage;
