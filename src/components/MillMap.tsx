import React, { useState, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = { width: '100%', height: '100%' };
const center = { lat: 10.7769, lng: 106.7009 };

const MillMap: React.FC<{ stores: any[] }> = ({ stores }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  });

  const [selectedStore, setSelectedStore] = useState<any>(null);

  // 1. 아이콘 설정을 useMemo로 관리하여 불필요한 재계산 방지 및 안전성 확보
  const getMarkerIcon = (category: string) => {
    if (!isLoaded || !window.google) return undefined;

    const cat = category?.toLowerCase().trim();
    let url = 'https://cdn-icons-png.flaticon.com/512/684/684908.png';

    if (cat === 'karaoke') url = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743624/microphone_nq2l7d.png';
    if (cat === 'barber') url = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/barber-pole_nfqbfz.png';
    if (cat === 'massage') url = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/foot-massage_ox9or9.png';
    if (cat === 'barclub') url = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/cocktail_byowmk.png';

    return {
      url,
      // 🚨 window.google.maps 객체를 직접 참조하여 사이즈 정의
      scaledSize: new window.google.maps.Size(40, 40),
      origin: new window.google.maps.Point(0, 0),
      anchor: new window.google.maps.Point(20, 20),
    };
  };

  if (!isLoaded) return <div className="w-full h-full bg-gray-100 animate-pulse" />;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={14}
      options={{
        // 🚨 지도가 어두운 문제를 해결하기 위해 스타일을 완전히 비웁니다.
        styles: [], 
        mapTypeId: 'roadmap',
        disableDefaultUI: false,
      }}
    >
      {/* 2. 맵이 완전히 로드된 후에만 마커를 그리도록 보장 */}
      {isLoaded && window.google && stores.map((store) => (
        <Marker
          key={`${store.id}-${store.category}`}
          position={{ lat: Number(store.lat), lng: Number(store.lng) }}
          icon={getMarkerIcon(store.category)}
          onClick={() => setSelectedStore(store)}
          // 톡 떨어지는 애니메이션 추가로 생성 확인
          animation={window.google.maps.Animation.DROP}
        />
      ))}

      {selectedStore && (
        <InfoWindow
          position={{ lat: Number(selectedStore.lat), lng: Number(selectedStore.lng) }}
          onCloseClick={() => setSelectedStore(null)}
        >
          <div className="p-2 text-black">
            <h4 className="font-bold text-sm">{selectedStore.name}</h4>
            <p className="text-[10px] text-gray-500">{selectedStore.address}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default MillMap;
