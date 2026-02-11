import React, { useEffect, useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';

const mapContainerStyle = { width: '100%', height: '100%' };
// 기본 중심점 (호치민 1군)
const DEFAULT_CENTER = { lat: 10.7769, lng: 106.7009 };

// 라이브러리 고정 (재로딩 방지)
const LIBRARIES: ("marker" | "drawing" | "geometry" | "places" | "visualization")[] = ['marker'];

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
    libraries: LIBRARIES
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  // ✅ 동적 중심점 계산: 데이터가 있으면 그 위치를 중심으로, 없으면 기본값으로.
  const mapCenter = useMemo(() => {
    if (stores && stores.length === 1) {
      const lat = Number(stores[0].lat);
      const lng = Number(stores[0].lng);
      if (!isNaN(lat) && lat !== 0) return { lat, lng };
    }
    return DEFAULT_CENTER;
  }, [stores]);

  useEffect(() => {
    const renderMarkers = async () => {
      if (isLoaded && mapRef.current && stores && stores.length > 0) {
        // 1. 기존 마커 완전 제거
        markersRef.current.forEach(marker => (marker.map = null));
        markersRef.current = [];

        try {
          const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

          stores.forEach((store) => {
            const lat = Number(store.lat || store.Lat);
            const lng = Number(store.lng || store.Ing || store.Lng);
            
            if (isNaN(lat) || isNaN(lng) || lat === 0) return;

            const iconImg = document.createElement('img');
            iconImg.src = ICON_ASSETS[store.category?.toLowerCase()] || ICON_ASSETS.default;
            iconImg.style.width = '42px';
            iconImg.style.height = '42px';
            iconImg.style.filter = 'drop-shadow(0px 4px 4px rgba(0,0,0,0.5))';
            iconImg.style.cursor = 'pointer';

            const marker = new AdvancedMarkerElement({
              map: mapRef.current,
              position: { lat, lng },
              title: store.name,
              content: iconImg, 
            });

            marker.addListener("click", () => {
              setSelectedStore(store);
              mapRef.current?.panTo({ lat, lng });
              mapRef.current?.setZoom(17);
            });

            markersRef.current.push(marker);
          });

          // ✅ 상세페이지 전용: 마커가 하나일 때 지도를 그 위치로 강제 이동 및 줌인
          if (stores.length === 1) {
            const lat = Number(stores[0].lat || stores[0].Lat);
            const lng = Number(stores[0].lng || stores[0].Ing || stores[0].Lng);
            if (!isNaN(lat) && lat !== 0) {
              mapRef.current.setCenter({ lat, lng });
              mapRef.current.setZoom(16);
            }
          }
        } catch (error) {
          console.error("Marker initialization error:", error);
        }
      }
    };

    renderMarkers();
  }, [isLoaded, stores]);

  if (!isLoaded) return (
    <div className="w-full h-full bg-neutral-950 flex items-center justify-center">
      <div className="text-red-600 font-black italic animate-pulse">MAP INITIALIZING...</div>
    </div>
  );

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={stores.length === 1 ? 16 : 14}
        onLoad={(map) => { mapRef.current = map; }}
        onClick={() => setSelectedStore(null)}
        options={{
          mapId: import.meta.env.VITE_GOOGLE_MAP_ID, 
          disableDefaultUI: false,
          backgroundColor: '#050505',
          gestureHandling: 'greedy',
          // 지도 스타일 최적화 (어두운 배경에서 마커 강조)
          maxZoom: 20,
          minZoom: 5
        }}
      />

      {/* 선택된 스토어 카드 (기존 디자인 유지) */}
      {selectedStore && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[320px] bg-[#1a1a1a] border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] overflow-hidden z-[999] animate-in fade-in slide-in-from-bottom-2">
          <div className="relative h-32">
            <img 
              src={selectedStore.image_url || 'https://via.placeholder.com/400x200?text=No+Image'} 
              className="w-full h-full object-cover"
              alt={selectedStore.name}
            />
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedStore(null); }}
              className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-red-600 transition-all"
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
              className="w-full py-3.5 bg-red-600 text-white font-black italic uppercase text-xs rounded-2xl shadow-lg shadow-red-600/30 active:scale-95 transition-all"
            >
              상세 정보 보기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// useMemo 사용을 위해 상단에 import { useMemo } from 'react'; 를 추가하거나 React.useMemo로 사용
import { useMemo } from 'react'; 
export default MillMap;
