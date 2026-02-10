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

const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#181818" }] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
];

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

  // Flaticon 링크 기반 카테고리별 아이콘 설정
  const getIcon = (category: string) => {
    const cat = category?.toLowerCase().trim();
    
    // 기본 마커 (핀 모양)
    let url = 'https://cdn-icons-png.flaticon.com/512/684/684908.png';
    
    // 사용자가 제공한 Flaticon 링크 기반 아이콘 매핑
    if (cat === 'karaoke') url = 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png'; // Karaoke (Freepik)
    if (cat === 'massage') url = 'https://cdn-icons-png.flaticon.com/512/833/833472.png';   // Massage (Darius Dan)
    if (cat === 'barber') url = 'https://cdn-icons-png.flaticon.com/512/8146/8146003.png';  // Barber shop (Freepik)
    if (cat === 'barclub') url = 'https://cdn-icons-png.flaticon.com/512/3813/3813681.png'; // Alcohol/Club (Freepik)

    return {
      url,
      // 512x512 원본을 35x35로 강제 축소하여 선명하게 표시
      scaledSize: new window.google.maps.Size(35, 35),
      origin: new window.google.maps.Point(0, 0),
      anchor: new window.google.maps.Point(17, 17), // 아이콘의 정중앙이 좌표에 오도록 설정
    };
  };

  if (!isLoaded) return <div className="w-full h-full bg-[#111] animate-pulse" />;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={14}
      options={{
        styles: darkMapStyle,
        disableDefaultUI: false,
        zoomControl: true,
      }}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {stores.filter(s => (s.lat || s.Lat) && (s.lng || s.Ing)).map((store) => {
        // DB 컬럼명 혼용 대응 (lat/Lat, lng/Ing)
        const lat = Number(store.lat || store.Lat);
        const lng = Number(store.lng || store.Ing);

        return (
          <Marker
            key={store.id}
            position={{ lat, lng }}
            icon={getIcon(store.category)}
            onClick={() => setSelectedStore(store)}
            // 마커에 마우스 올렸을 때 이름 표시
            title={store.name}
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
            <h4 className="font-black text-sm mb-1">{selectedStore.name}</h4>
            <p className="text-[10px] text-gray-600 mb-2">{selectedStore.address}</p>
            <a 
              href={`/store/${selectedStore.id}`}
              className="text-[10px] font-bold text-red-600 underline"
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
