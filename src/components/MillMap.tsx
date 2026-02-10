import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = { width: '100%', height: '100%' };
const center = { lat: 10.7769, lng: 106.7009 };

const MillMap: React.FC<{ stores: any[] }> = ({ stores }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  });

  const [selectedStore, setSelectedStore] = useState<any>(null);

  if (!isLoaded) return <div className="w-full h-full bg-white flex items-center justify-center text-black font-bold">지도 로딩 중...</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={14}
      options={{
        styles: [], // 기본 테마 강제
        mapTypeId: 'roadmap',
        disableDefaultUI: false,
        backgroundColor: '#ffffff'
      }}
    >
      {stores.map((store) => {
        const lat = Number(store.lat);
        const lng = Number(store.lng);
        if (isNaN(lat) || isNaN(lng)) return null;

        // DB의 category 값 처리
        const cat = String(store.category || "").toLowerCase().trim();
        
        // 🧪 구글 공식 컬러 핀으로 테스트 (Cloudinary 이미지 대신)
        // 로직이 맞다면 카테고리별로 핀의 색깔이 바뀌어야 합니다.
        let iconUrl = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'; // 기본: 빨강

        if (cat === 'karaoke') {
          iconUrl = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'; // 가라오케: 파랑
        } else if (cat === 'barber') {
          iconUrl = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'; // 이발소: 노랑
        } else if (cat === 'massage') {
          iconUrl = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'; // 마사지: 초록
        } else if (cat === 'barclub') {
          iconUrl = 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png'; // 바/클럽: 보라
        }

        return (
          <Marker
            key={store.id}
            position={{ lat, lng }}
            onClick={() => setSelectedStore(store)}
            // window.google 객체가 확실히 로드된 후 아이콘 적용
            icon={window.google ? {
              url: iconUrl,
              scaledSize: new window.google.maps.Size(40, 40),
            } : undefined}
          />
        );
      })}

      {selectedStore && (
        <InfoWindow
          position={{ lat: Number(selectedStore.lat), lng: Number(selectedStore.lng) }}
          onCloseClick={() => setSelectedStore(null)}
        >
          <div className="p-2 text-black bg-white">
            <h4 className="font-bold text-sm text-black">{selectedStore.name}</h4>
            <p className="text-[10px] text-gray-500">{selectedStore.address}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default MillMap;
