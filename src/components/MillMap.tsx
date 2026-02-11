import React, { useEffect, useRef, useState, useMemo } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';

const mapContainerStyle = { width: '100%', height: '100%' };
const DEFAULT_CENTER = { lat: 10.7769, lng: 106.7009 };

const LIBRARIES: ("marker" | "drawing" | "geometry" | "places" | "visualization")[] = ['marker', 'places'];

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
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]); // 마커 객체들을 관리할 Ref
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES
  });

  const mapCenter = useMemo(() => {
    if (stores && stores.length > 0) {
      const target = stores[0];
      const lat = Number(target.lat || target.Lat);
      const lng = Number(target.lng || target.Ing || target.Lng);
      if (!isNaN(lat) && lat !== 0) return { lat, lng };
    }
    return DEFAULT_CENTER;
  }, [stores]);

  // 마커를 직접 생성하는 로직
  useEffect(() => {
    if (isLoaded && mapRef.current && stores) {
      // 1. 기존 마커 제거
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];

      // 2. 새 마커 생성 (순수 JS 방식)
      stores.forEach(store => {
        const lat = Number(store.lat || store.Lat);
        const lng = Number(store.lng || store.Ing || store.Lng);
        if (isNaN(lat) || lat === 0) return;

        const marker = new google.maps.Marker({
          position: { lat, lng },
          map: mapRef.current as google.maps.Map,
          title: store.name,
          icon: {
            url: ICON_ASSETS[store.category?.toLowerCase()] || ICON_ASSETS.default,
            scaledSize: new google.maps.Size(42, 42),
            anchor: new google.maps.Point(21, 21),
          }
        });

        marker.addListener('click', () => {
          setSelectedStore(store);
          mapRef.current?.panTo({ lat, lng });
        });

        markersRef.current.push(marker);
      });

      // 3. 상세페이지인 경우 포커싱
      if (stores.length === 1) {
        mapRef.current.panTo(mapCenter);
        mapRef.current.setZoom(17);
      }
    }
  }, [isLoaded, stores, mapCenter]);

  if (!isLoaded) return (
    <div className="w-full h-full bg-[#050505] flex items-center justify-center">
      <div className="text-red-600 font-black italic animate-pulse">CONNECTING SATELLITE...</div>
    </div>
  );

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={stores.length === 1 ? 17 : 14}
        onLoad={(map) => { mapRef.current = map; }}
        onClick={() => setSelectedStore(null)}
        options={{
          disableDefaultUI: false,
          backgroundColor: '#050505',
          gestureHandling: 'greedy',
          styles: [
            { elementType: "geometry", stylers: [{ color: "#212121" }] },
            { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
            { path: "road", elementType: "geometry", stylers: [{ color: "#303030" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] }
          ]
        }}
      />

      {/* 선택된 스토어 카드 */}
      {selectedStore && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[320px] bg-[#1a1a1a] border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-[999] animate-in fade-in slide-in-from-bottom-2">
          <div className="relative h-32">
            <img 
              src={selectedStore.image_url || 'https://via.placeholder.com/400x200?text=No+Image'} 
              className="w-full h-full object-cover"
              alt={selectedStore.name}
            />
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedStore(null); }}
              className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-lg"
            >
              ✕
            </button>
          </div>
          <div className="p-5">
            <h4 className="text-xl font-black italic text-white mb-1 uppercase tracking-tighter">
              {selectedStore.name}
            </h4>
            <p className="text-gray-300 text-[10px] font-bold uppercase mb-4 tracking-tight leading-relaxed line-clamp-2">
              {selectedStore.address}
            </p>
            <button 
              onClick={() => navigate(`/store/${selectedStore.id}`)}
              className="w-full py-3.5 bg-red-600 text-white font-black italic uppercase text-xs rounded-2xl shadow-lg active:scale-95 transition-all"
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
