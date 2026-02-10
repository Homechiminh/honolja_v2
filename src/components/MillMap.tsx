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

  const getIcon = (category: string) => {
    let url = 'https://cdn-icons-png.flaticon.com/512/684/684908.png';
    
    if (category === 'karaoke') url = 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png';
    if (category === 'massage') url = 'https://cdn-icons-png.flaticon.com/512/833/833472.png';
    if (category === 'barber') url = 'https://cdn-icons-png.flaticon.com/512/8146/8146003.png';
    if (category === 'barclub') url = 'https://cdn-icons-png.flaticon.com/512/3813/3813681.png';

    return {
      url,
      scaledSize: new window.google.maps.Size(35, 35),
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
      {stores.filter(s => s.lat && s.lng).map((store) => (
        <Marker
          key={store.id}
          position={{ lat: Number(store.lat), lng: Number(store.lng) }}
          icon={getIcon(store.category)}
          onClick={() => setSelectedStore(store)}
        />
      ))}

      {selectedStore && (
        <InfoWindow
          position={{ lat: Number(selectedStore.lat), lng: Number(selectedStore.lng) }}
          onCloseClick={() => setSelectedStore(null)}
        >
          <div className="p-2 text-black min-w-[150px]">
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
