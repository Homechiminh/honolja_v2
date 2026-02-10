import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = { width: '100%', height: '100%' };
// 초기 중심 좌표 (호치민)
const center = { lat: 10.7769, lng: 106.7009 };

// 1. 아이콘 경로 정의 (절대 경로 사용)
const ICON_ASSETS = {
  karaoke: 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743624/microphone_nq2l7d.png',
  barber: 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/barber-pole_nfqbfz.png',
  massage: 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/foot-massage_ox9or9.png',
  barclub: 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/cocktail_byowmk.png',
  default: 'https://cdn-icons-png.flaticon.com/512/684/684908.png'
};

const MillMap: React.FC<{ stores: any[] }> = ({ stores }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  });

  const [selectedStore, setSelectedStore] = useState<any>(null);

  if (!isLoaded) return <div className="w-full h-full bg-white" />;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={14}
      options={{
        styles: [], // 전역 스타일 간섭 방지
        mapTypeId: 'roadmap',
        backgroundColor: '#ffffff',
        disableDefaultUI: false,
      }}
    >
      {stores.map((store) => {
        // 2. 좌표 변환 (수동 입력된 값도 안전하게 처리)
        const lat = Number(store.lat);
        const lng = Number(store.lng);
        
        if (isNaN(lat) || isNaN(lng)) return null;

        // 3. 아이콘 강제 매칭 로직
        // DB의 category 컬럼값이 무엇이든 소문자로 변환해 비교
        const categoryKey = String(store.category || "").toLowerCase().trim();
        
        let finalIcon = ICON_ASSETS.default;
        if (categoryKey.includes('karaoke')) finalIcon = ICON_ASSETS.karaoke;
        else if (categoryKey.includes('barber')) finalIcon = ICON_ASSETS.barber;
        else if (categoryKey.includes('massage')) finalIcon = ICON_ASSETS.massage;
        else if (categoryKey.includes('barclub') || categoryKey.includes('bar')) finalIcon = ICON_ASSETS.barclub;

        return (
          <Marker
            key={store.id}
            position={{ lat, lng }}
            onClick={() => setSelectedStore(store)}
            // 4. 아이콘 객체화 (크기 고정)
            icon={window.google ? {
              url: finalIcon,
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 20),
            } : undefined}
          />
        );
      })}

      {selectedStore && (
        <InfoWindow
          position={{ lat: Number(selectedStore.lat), lng: Number(selectedStore.lng) }}
          onCloseClick={() => setSelectedStore(null)}
        >
          <div className="p-1" style={{ color: '#000', backgroundColor: '#fff' }}>
            <h4 className="font-bold text-sm" style={{ color: '#000' }}>{selectedStore.name}</h4>
            <p className="text-[10px]" style={{ color: '#666' }}>{selectedStore.address}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default MillMap;
