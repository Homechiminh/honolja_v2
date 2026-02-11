import React, { useEffect, useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';

const mapContainerStyle = { width: '100%', height: '100%' };
const center = { lat: 10.7769, lng: 106.7009 };

const ICON_ASSETS: Record<string, string> = {
  karaoke: 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743624/microphone_nq2l7d.png',
  barber: 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/barber-pole_nfqbfz.png',
  massage: 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/foot-massage_ox9or9.png',
  barclub: 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/cocktail_byowmk.png',
  villa: 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770754541/villa_nf3ksq.png',
  default: 'https://cdn-icons-png.flaticon.com/512/684/684908.png'
};

const MillMap: React.FC<{ stores: any[] }> = ({ stores }) => {
  const navigate = useNavigate();
  const [selectedStore, setSelectedStore] = useState<any | null>(null);
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: ['marker'] 
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  useEffect(() => {
    const renderMarkers = async () => {
      if (isLoaded && mapRef.current && stores.length > 0) {
        markersRef.current.forEach(marker => (marker.map = null));
        markersRef.current = [];

        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

        stores.forEach((store) => {
          const lat = Number(store.lat);
          const lng = Number(store.lng);
          if (isNaN(lat) || isNaN(lng)) return;

          const iconImg = document.createElement('img');
          iconImg.src = ICON_ASSETS[store.category?.toLowerCase()] || ICON_ASSETS.default;
          iconImg.style.width = '40px';
          iconImg.style.height = '40px';
          iconImg.style.cursor = 'pointer';

          const marker = new AdvancedMarkerElement({
            map: mapRef.current,
            position: { lat, lng },
            title: store.name,
            content: iconImg, 
          });

          // 마커 클릭 시 카드 노출
          marker.addListener("click", () => {
            setSelectedStore(store);
            mapRef.current?.panTo({ lat, lng });
          });

          markersRef.current.push(marker);
        });
      }
    };
    renderMarkers();
  }, [isLoaded, stores]);

  if (!isLoaded) return <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white">MAP LOADING...</div>;

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={14}
        onLoad={(map) => { mapRef.current = map; }}
        onClick={() => setSelectedStore(null)}
        options={{
          mapId: import.meta.env.VITE_GOOGLE_MAP_ID, 
          disableDefaultUI: false,
          backgroundColor: '#111827',
          gestureHandling: 'greedy'
        }}
      />

      {/* 📍 업소 정보 카드 - 이전 StoreMapPage에서 쓰던 그 스타일 */}
      {selectedStore && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[320px] bg-[#111]/95 backdrop-blur-md border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[999] animate-in fade-in slide-in-from-bottom-2">
          <div className="relative h-32">
            <img 
              src={selectedStore.image_url || 'https://via.placeholder.com/400x200?text=No+Image'} 
              className="w-full h-full object-cover"
              alt={selectedStore.name}
            />
            <button 
              onClick={() => setSelectedStore(null)}
              className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="p-5">
            <h4 className="text-xl font-black italic text-white mb-1 uppercase tracking-tighter">{selectedStore.name}</h4>
            <p className="text-gray-500 text-[10px] font-bold uppercase mb-4 opacity-60 truncate">{selectedStore.address}</p>
            <button 
              onClick={() => navigate(`/store/${selectedStore.id}`)}
              className="w-full py-3.5 bg-red-600 text-white font-black italic uppercase text-xs rounded-2xl shadow-lg shadow-red-600/20 active:scale-95 transition-all"
            >
              상세 정보 보기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MillMap;
