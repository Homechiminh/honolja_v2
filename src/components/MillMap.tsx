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

// 🛠️ 시인성을 방해하는 다크스타일 변수를 제거하거나 비웁니다.
const lightMapStyle = []; 

interface MillMapProps {
  stores: any[];
}

const MillMap: React.FC<MillMapProps> = ({ stores }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  });

  const [, setMap] = useState<google.maps.Map | null>(null);
  const [selectedStore, setSelectedStore] = useState<any>(null);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // 🔗 Cloudinary 링크 기반 카테고리별 아이콘 설정
  const getIcon = (category: string) => {
    const cat = category?.toLowerCase().trim();
    
    // 기본 마커
    let url = 'https://cdn-icons-png.flaticon.com/512/684/684908.png';
    
    // 🔴 전달해주신 Cloudinary 직접 링크로 모두 교체했습니다.
    if (cat === 'karaoke') url = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743624/microphone_nq2l7d.png';
    if (cat === 'barber') url = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/barber-pole_nfqbfz.png';
    if (cat === 'massage') url = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/foot-massage_ox9or9.png';
    if (cat === 'barclub') url = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/cocktail_byowmk.png';

    return {
      url,
      // 기본 지도에서 가장 보기 좋은 사이즈 40x40
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
        // 🛠️ styles: lightMapStyle 로 변경하여 기본 지도를 보여줍니다.
        styles: lightMapStyle,
        disableDefaultUI: false,
        zoomControl: true,
      }}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {stores.map((store) => {
        const lat = Number(store.lat || store.Lat);
        const lng = Number(store.lng || store.Ing);

        return (
          <Marker
            key={store.id}
            position={{ lat, lng }}
            icon={getIcon(store.category)}
            onClick={() => setSelectedStore(store)}
            title={store.name}
            // 마커가 떨어지는 애니메이션 추가 (시인성 업)
            animation={window.google.maps.Animation.DROP}
          />
        );
      })}

      {selectedStore && (
        <InfoWindow
          position={{ 
            lat: Number(selectedStore.lat || selectedStore.Lat), 
            lng: Number(selectedStore.lng || selectedStore.Ing) 
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
              상세보기 VIEW MORE
            </a>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default MillMap;
