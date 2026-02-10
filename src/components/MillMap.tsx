import React, { useState } from 'react';
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

  if (!isLoaded) return <div className="w-full h-full bg-white" />;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={14}
      options={{
        // 🚨 중요: undefined가 아니라 null이나 []를 주어 기존 스타일을 강제 초기화합니다.
        styles: [], 
        disableDefaultUI: false,
        zoomControl: true,
      }}
    >
      {stores.map((store) => {
        const lat = Number(store.lat);
        const lng = Number(store.lng);
        const cat = store.category?.toLowerCase().trim();

        // 🔗 아이콘 경로 설정
        let iconUrl = 'https://cdn-icons-png.flaticon.com/512/684/684908.png';
        if (cat === 'karaoke') iconUrl = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743624/microphone_nq2l7d.png';
        if (cat === 'barber') iconUrl = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/barber-pole_nfqbfz.png';
        if (cat === 'massage') iconUrl = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/foot-massage_ox9or9.png';
        if (cat === 'barclub') iconUrl = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/cocktail_byowmk.png';

        return (
          <Marker
            key={`${store.id}-${cat}`} // 카테고리 변경 시 마커 리렌더링 강제
            position={{ lat, lng }}
            onClick={() => setSelectedStore(store)}
            // 🚨 아이콘 객체를 Marker 내부에 직접 선언
            icon={{
              url: iconUrl,
              scaledSize: new window.google.maps.Size(45, 45),
              anchor: new window.google.maps.Point(22, 22),
            }}
          />
        );
      })}

      {selectedStore && (
        <InfoWindow
          position={{ lat: Number(selectedStore.lat), lng: Number(selectedStore.lng) }}
          onCloseClick={() => setSelectedStore(null)}
        >
          <div className="p-2 text-black min-w-[150px]">
            <p className="text-[9px] font-black text-red-600 uppercase italic mb-0.5">
              {selectedStore.category}
            </p>
            <h4 className="font-bold text-sm mb-1">{selectedStore.name}</h4>
            <p className="text-[10px] text-gray-600 mb-2">{selectedStore.address}</p>
            <a href={`/store/${selectedStore.id}`} className="text-[10px] font-bold text-blue-600 underline">
              상세보기
            </a>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default MillMap;
