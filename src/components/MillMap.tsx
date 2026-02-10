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
        styles: [], // 기본 밝은 테마 사용
        mapTypeId: 'roadmap',
        disableDefaultUI: false,
        backgroundColor: '#ffffff'
      }}
    >
      {stores.map((store) => {
        const lat = Number(store.lat);
        const lng = Number(store.lng);
        
        // Supabase category 컬럼 값 (karaoke, barber, massage, barclub)
        const cat = String(store.category || "").toLowerCase().trim();
        
        // 기본 핀 이미지
        let iconUrl = 'https://cdn-icons-png.flaticon.com/512/684/684908.png';

        if (cat === 'karaoke') {
          iconUrl = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743624/microphone_nq2l7d.png';
        } else if (cat === 'barber') {
          iconUrl = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/barber-pole_nfqbfz.png';
        } else if (cat === 'massage') {
          iconUrl = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/foot-massage_ox9or9.png';
        } else if (cat === 'barclub') {
          iconUrl = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/cocktail_byowmk.png';
        }

        return (
          <Marker
            key={store.id}
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
