import React, { useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';

const mapContainerStyle = { width: '100%', height: '100%' };
const center = { lat: 10.7769, lng: 106.7009 };

// 카테고리별 커스텀 아이콘 설정
const ICON_ASSETS: Record<string, string> = {
  karaoke: 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743624/microphone_nq2l7d.png',
  barber: 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/barber-pole_nfqbfz.png',
  massage: 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/foot-massage_ox9or9.png',
  barclub: 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/cocktail_byowmk.png',
  villa: 'https://cdn-icons-png.flaticon.com/512/609/609803.png', // 빌라 아이콘 유지
  default: 'https://cdn-icons-png.flaticon.com/512/684/684908.png'
};

const MillMap: React.FC<{ stores: any[] }> = ({ stores }) => {
  const navigate = useNavigate(); // [추가] 페이지 이동을 위한 훅
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: ['marker'] 
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  useEffect(() => {
    const renderMarkers = async () => {
      if (isLoaded && mapRef.current && stores.length > 0) {
        // 기존 마커 제거
        markersRef.current.forEach(marker => (marker.map = null));
        markersRef.current = [];

        // 최신 마커 라이브러리 로드
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

        stores.forEach((store) => {
          const lat = Number(store.lat);
          const lng = Number(store.lng);
          if (isNaN(lat) || isNaN(lng)) return;

          const cat = String(store.category || "").toLowerCase().trim();
          
          // 마커용 커스텀 이미지 생성
          const iconImg = document.createElement('img');
          iconImg.src = ICON_ASSETS[cat] || ICON_ASSETS.default;
          iconImg.style.width = '40px';
          iconImg.style.height = '40px';
          iconImg.style.cursor = 'pointer'; // [추가] 마우스 올리면 포인터로 변경

          const marker = new AdvancedMarkerElement({
            map: mapRef.current,
            position: { lat, lng },
            title: store.name,
            content: iconImg, 
          });

          // [추가] 마커 클릭 시 상세 페이지로 이동
          marker.addListener("click", () => {
            if (store.id) {
              navigate(`/store/${store.id}`);
            }
          });

          markersRef.current.push(marker);
        });
      }
    };

    renderMarkers();
  }, [isLoaded, stores, navigate]);

  if (!isLoaded) return <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white">지도 로딩 중...</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={14}
      onLoad={(map) => { mapRef.current = map; }}
      options={{
        // Vercel에 등록한 Map ID 적용
        mapId: import.meta.env.VITE_GOOGLE_MAP_ID, 
        disableDefaultUI: false,
        backgroundColor: '#111827',
        gestureHandling: 'greedy'
      }}
    />
  );
};

export default MillMap;
