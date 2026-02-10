import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: 10.7769,
  lng: 106.7009,
};

interface MillMapProps {
  stores: any[];
}

const MillMap: React.FC<MillMapProps> = ({ stores }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  });

  const [selectedStore, setSelectedStore] = useState<any>(null);

  // 아이콘을 생성하는 함수
  const getIcon = (category: string) => {
    // window.google 객체가 로드된 후에만 실행되도록 보장
    if (typeof window === 'undefined' || !window.google) return undefined;

    const cat = category?.toLowerCase().trim();
    let url = 'https://cdn-icons-png.flaticon.com/512/684/684908.png'; // 기본 핀

    // 사용자가 제공한 Cloudinary 링크 매핑
    if (cat === 'karaoke') url = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743624/microphone_nq2l7d.png';
    if (cat === 'barber') url = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/barber-pole_nfqbfz.png';
    if (cat === 'massage') url = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/foot-massage_ox9or9.png';
    if (cat === 'barclub') url = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/cocktail_byowmk.png';

    return {
      url,
      scaledSize: new window.google.maps.Size(45, 45), // 아이콘 크기 확대
      origin: new window.google.maps.Point(0, 0),
      anchor: new window.google.maps.Point(22, 22),
    };
  };

  if (!isLoaded) return <div className="w-full h-full bg-white animate-pulse" />;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={14}
      options={{
        // 빈 배열을 설정하여 기존 다크모드 스타일을 강제로 덮어씌웁니다.
        styles: [], 
        disableDefaultUI: false,
        zoomControl: true,
      }}
    >
      {stores.map((store) => {
        const lat = Number(store.lat);
        const lng = Number(store.lng);

        if (isNaN(lat) || isNaN(lng)) return null;

        return (
          <Marker
            key={store.id}
            position={{ lat, lng }}
            icon={getIcon(store.category)}
            onClick={() => setSelectedStore(store)}
            animation={window.google.maps.Animation.DROP} // 마커 애니메이션
          />
        );
      })}

      {selectedStore && (
        <InfoWindow
          position={{ 
            lat: Number(selectedStore.lat), 
            lng: Number(selectedStore.lng) 
          }}
          onCloseClick={() => setSelectedStore(null)}
        >
          <div className="p-2 text-black min-w-[150px]">
            <p className="text-[9px] font-black text-red-600 uppercase italic mb-0.5">
              {selectedStore.category}
            </p>
            <h4 className="font-bold text-sm mb-1">{selectedStore.name}</h4>
            <p className="text-[10px] text-gray-600 mb-2">{selectedStore.address}</p>
            <a 
              href={`/store/${selectedStore.id}`}
              className="text-[10px] font-bold text-blue-600 underline"
            >
              상세보기
            </a>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default MillMap;
