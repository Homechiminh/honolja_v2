import React, { useEffect, useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';

const mapContainerStyle = { width: '100%', height: '100%' };
const center = { lat: 10.7769, lng: 106.7009 };

// ✅ 1. 라이브러리 배열을 컴포넌트 외부로 빼서 "고정"시켜야 재로딩 경고가 사라집니다.
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
    libraries: LIBRARIES // ✅ 고정된 변수 사용 (경고 해결 핵심)
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  useEffect(() => {
    const renderMarkers = async () => {
      // ✅ isLoaded와 mapRef.current가 확실히 있을 때만 실행
      if (isLoaded && mapRef.current && stores && stores.length > 0) {
        // 기존 마커 제거
        markersRef.current.forEach(marker => (marker.map = null));
        markersRef.current = [];

        try {
          const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

          stores.forEach((store) => {
            const lat = Number(store.lat);
            const lng = Number(store.lng);
            if (isNaN(lat) || isNaN(lng) || lat === 0) return;

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

            marker.addListener("click", () => {
              setSelectedStore(store);
              mapRef.current?.panTo({ lat, lng });
              // 줌 인 효과 추가 (상세페이지 지도에서 가시성 확보)
              mapRef.current?.setZoom(16);
            });

            markersRef.current.push(marker);
          });

          // 상세페이지용: 데이터가 하나뿐일 경우 해당 위치로 중심 이동
          if (stores.length === 1) {
            const singleLat = Number(stores[0].lat);
            const singleLng = Number(stores[0].lng);
            if (!isNaN(singleLat)) {
               mapRef.current.setCenter({ lat: singleLat, lng: singleLng });
            }
          }
        } catch (error) {
          console.error("Marker rendering failed:", error);
        }
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

export default MillMap;
