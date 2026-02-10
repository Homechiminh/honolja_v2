import React, { useEffect, useState } from 'react';
import MillMap from '../components/MillMap';
import { supabase } from '../lib/supabase'; // 사용하시는 DB 연결 방식에 맞춰 수정 (supabase 또는 firebase)

const StoreMapPage: React.FC = () => {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        // SQL Editor로 컬럼 추가하신 테이블에서 데이터를 가져옵니다.
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .not('lat', 'is', null) // 위도가 있는 것만
          .not('lng', 'is', null); // 경도가 있는 것만

        if (error) throw error;
        setStores(data || []);
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
        <MillMap stores={stores} />
      )}
      
      {/* 지도 위에 띄울 간단한 제목 레이어 (선택사항) */}
      <div className="absolute top-4 left-4 z-10 bg-black/70 p-4 rounded-lg border border-white/10 backdrop-blur-md">
        <h1 className="text-xl font-black text-white">HONOLJA MAP</h1>
        <p className="text-xs text-gray-400">호치민 전지역 업체 위치 안내</p>
      </div>
    </div>
  );
};

export default StoreMapPage;
