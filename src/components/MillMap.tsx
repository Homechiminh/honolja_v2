import React, { useState, useEffect } from 'react';
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

  // 아이콘 함수: 직접 객체를 리턴하여 렌더링 시점에 생성
  const getIcon = (category: string) => {
    if (typeof window === 'undefined' || !window.google) return undefined;

    const cat = category?.toLowerCase().trim();
    let url = 'https://cdn-icons-png.flaticon.com/512/684/684908.png';

    if (cat === 'karaoke') url = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743624/microphone_nq2l7d.png';
    if (cat === 'barber') url = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/barber-pole_nfqbfz.png';
    if (cat === 'massage') url = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/foot-massage_ox9or9.png';
    if (cat === 'barclub') url = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/cocktail_byowmk.png';

    return {
      url,
      // 아이콘이 확실히 보이도록 45px로 설정
      scaledSize: new window.google.maps.Size(45, 45),
      anchor: new window.google.maps.Point(22, 22),
    };
  };

  if (!isLoaded) return <div className="w-full h-full bg-white" />;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={14}
      options={{
        // 🚨 중요: 빈 배열([])을 주면 다크모드 설정이 초기화되어 도로가 보입니다.
        styles: [], 
        disableDefaultUI: false,
        zoomControl: true,
        // 아래 설정을 추가하면 아이콘 가시성이 좋아집니다.
        clickableIcons: true,
      }}
    >
      {stores.map((store) => (
        <Marker
          key={store.id}
          position={{ lat: Number(store.lat), lng: Number(store.lng) }}
          // 중요: key값에 카테고리를 포함하면 아이콘 변경 시 마커를 강제로 다시 그립니다.
          icon={getIcon(store.category)}
          onClick={() => setSelectedStore(store)}
          animation={window.google.maps.Animation.DROP}
        />
      ))}

      {selectedStore && (
        <InfoWindow
          position={{ lat: Number(selectedStore.lat), lng: Number(selectedStore.lng) }}
          onCloseClick={() => setSelectedStore(null)}
        >
          <div className="p-2 text-black min-w-[150px]">
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
