import React, { useEffect, useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

const mapContainerStyle = { width: '100%', height: '100%' };
const center = { lat: 10.7769, lng: 106.7009 };

// 카테고리별 커스텀 아이콘 자산 설정
const ICON_ASSETS: Record<string, string> = {
  karaoke: 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743624/microphone_nq2l7d.png',
  barber: 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/barber-pole_nfqbfz.png',
  massage: 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/foot-massage_ox9or9.png',
  barclub: 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/cocktail_byowmk.png',
  default: 'https://cdn-icons-png.flaticon.com/512/684/684908.png'
};

const MillMap: React.FC<{ stores: any[] }> = ({ stores }) => {
  // Advanced Marker를 사용하기 위해 'marker' 라이브러리를 명시적으로 로드합니다.
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: ['marker']
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  useEffect(() => {
    const renderMarkers = async () => {
      // 지도와 라이브러리가 로드되고 데이터가 있을 때 실행
      if (isLoaded && mapRef.current && stores.length > 0) {
        // 기존 마커 초기화
        markersRef.current.forEach(marker => (marker.map = null));
        markersRef.current = [];

        // Advanced Marker 라이브러리 호출
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

        stores.forEach((store) => {
          const lat = Number(store.lat);
          const lng = Number(store.lng);
          
          if (isNaN(lat) || isNaN(lng)) return;

          // 카테고리 매칭 로직 (Supabase Table 기준)
          const cat = String(store.category || "").toLowerCase().trim();
          
          // 마커용 커스텀 HTML 요소(img) 생성
          const iconImg = document.createElement('img');
          iconImg.src = ICON_ASSETS[cat] || ICON_ASSETS.default;
          iconImg.style.width = '40px';
          iconImg.style.height = '40px';

          // Advanced Marker 생성 (CSS 간섭 방지를 위해 content 속성 사용)
          const marker = new AdvancedMarkerElement({
            map: mapRef.current,
            position: { lat, lng },
            title: store.name,
            content: iconImg, 
          });

          // 클릭 이벤트 추가 (필요 시 InfoWindow 로직 결합 가능)
          marker.addListener('click', () => {
            console.log(`${store.name} 클릭됨`);
          });

          markersRef.current.push(marker);
        });
      }
    };

    renderMarkers();
  }, [isLoaded, stores]);

  if (!isLoaded) return <div className="w-full h-full bg-white flex items-center justify-center text-black">지도 로딩 중...</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={14}
      onLoad={(map) => { mapRef.current = map; }}
      options={{
        // 🚨 새로 생성한 지도 ID를 반드시 적용해야 합니다.
        mapId: import.meta.env.VITE_GOOGLE_MAP_ID || "YOUR_MAP_ID_HERE",
        disableDefaultUI: false,
        backgroundColor: '#ffffff',
        gestureHandling: 'greedy'
      }}
    />
  );
};

export default MillMap;
