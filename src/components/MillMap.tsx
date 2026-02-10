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

  if (!isLoaded) return <div className="w-full h-full bg-white" />;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={14}
      options={{
        // 🚨 지도가 어둡다면 이 options가 범인입니다. 
        // 스타일을 아예 정의하지 않거나 빈 배열을 주어 기본 테마를 강제합니다.
        styles: [], 
        mapTypeId: 'roadmap',
        disableDefaultUI: false,
      }}
    >
      {stores.map((store) => {
        // 🔍 아이콘이 안 나올 때 확인을 위한 로그
        // 브라우저 개발자 도구(F12) 콘솔에서 실제 어떤 값이 찍히는지 확인해보세요.
        console.log("Store 데이터:", store.name, "| 카테고리:", store.category);

        const lat = Number(store.lat);
        const lng = Number(store.lng);
        const cat = store.category?.toLowerCase().trim();

        // 🔗 Cloudinary 아이콘 링크
        let iconUrl = 'https://cdn-icons-png.flaticon.com/512/684/684908.png';
        if (cat === 'karaoke') iconUrl = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743624/microphone_nq2l7d.png';
        if (cat === 'barber') iconUrl = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/barber-pole_nfqbfz.png';
        if (cat === 'massage') iconUrl = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/foot-massage_ox9or9.png';
        if (cat === 'barclub') iconUrl = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/cocktail_byowmk.png';

        return (
          <Marker
            key={`${store.id}-${cat}`}
            position={{ lat, lng }}
            onClick={() => setSelectedStore(store)}
            icon={{
              url: iconUrl,
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 20),
            }}
          />
        );
      })}

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
