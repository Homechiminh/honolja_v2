import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

// 호치민 1군 중심 좌표
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

  const [, setMap] = useState<google.maps.Map | null>(null);
  const [selectedStore, setSelectedStore] = useState<any>(null);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  /**
   * 카테고리에 따른 Cloudinary 아이콘 매핑
   */
  const getIcon = (category: string) => {
    const cat = category?.toLowerCase().trim();
    
    // 매칭되는 카테고리가 없을 때 사용할 기본 핀 이미지
    let url = 'https://cdn-icons-png.flaticon.com/512/684/684908.png';
    
    // 사용자가 제공한 Cloudinary 링크 적용
    if (cat === 'karaoke') url = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743624/microphone_nq2l7d.png';
    if (cat === 'barber') url = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/barber-pole_nfqbfz.png';
    if (cat === 'massage') url = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/foot-massage_ox9or9.png';
    if (cat === 'barclub') url = 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/cocktail_byowmk.png';

    return {
      url,
      // 아이콘 크기 (40x40 픽셀이 표준 지도에서 가장 잘 보입니다)
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
        // 다크모드 스타일 코드를 제거하여 기본 지도가 나오게 함 (타입 에러 해결)
        disableDefaultUI: false,
        zoomControl: true,
      }}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {/* 데이터 유효성 검사 후 마커 표시 */}
      {stores.map((store) => {
        const lat = Number(store.lat || store.Lat);
        const lng = Number(store.lng || store.Ing);

        if (isNaN(lat) || isNaN(lng)) return null;

        return (
          <Marker
            key={store.id}
            position={{ lat, lng }}
            icon={getIcon(store.category)}
            onClick={() => setSelectedStore(store)}
            title={store.name}
            // 마커 생성 시 톡 떨어지는 애니메이션 효과
            animation={window.google.maps.Animation.DROP}
          />
        );
      })}

      {/* 마커 클릭 시 정보창 표시 */}
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
