// @ts-nocheck
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';

const mapContainerStyle = { width: '100%', height: '100%' };

// ✅ 1번 이미지처럼 보이게 하기 위한 호치민 1군 센터 좌표 (레탄동/벤탄 인근)
const HO_CHI_MINH_CENTER = { lat: 10.7765, lng: 106.7009 };

const LIBRARIES: ("marker" | "drawing" | "geometry" | "places" | "visualization")[] = ['marker', 'places'];

const ICON_ASSETS: Record<string, string> = {
  karaoke: 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743624/microphone_nq2l7d.png',
  barber: 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/barber-pole_nfqbfz.png',
  massage: 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/foot-massage_ox9or9.png',
  barclub: 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770743565/cocktail_byowmk.png',
  villa: 'https://res.cloudinary.com/dtkfzuyew/image/upload/v1770754541/villa_nf3ksq.png',
  default: 'https://cdn-icons-png.flaticon.com/512/684/684908.png'
};

const MillMap: React.FC<{ stores: any[], focusStoreId?: string | number }> = ({ stores, focusStoreId }) => {
  const navigate = useNavigate();
  const [selectedStore, setSelectedStore] = useState<any | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES
  });

  // 1. 중심점과 줌 레벨 결정 로직 최적화
  const { center, zoomLevel } = useMemo(() => {
    // A. 상세페이지 (focusStoreId가 있을 때) -> 해당 업소 초밀착
    if (focusStoreId && stores.length > 0) {
      const target = stores.find(s => String(s.id) === String(focusStoreId));
      if (target) {
        return {
          center: { lat: Number(target.lat || target.Lat), lng: Number(target.lng || target.Ing || target.Lng) },
          zoomLevel: 19 
        };
      }
    }
    
    // B. 커뮤니티 페이지 (그 외 모든 경우) -> 1번 이미지처럼 1군 중심의 넓은 뷰
    return { 
      center: HO_CHI_MINH_CENTER, 
      zoomLevel: 13 // 마커들이 넓게 퍼져 보이도록 줌을 13~14 정도로 설정
    };
  }, [stores, focusStoreId]);

  useEffect(() => {
    if (isLoaded && mapRef.current) {
      // 부드러운 이동보다 초기 렌더링 시 정확한 줌 유지를 위해 setCenter/setZoom 사용
      mapRef.current.setCenter(center);
      mapRef.current.setZoom(zoomLevel);
    }
  }, [isLoaded, center, zoomLevel]);

  if (!isLoaded) return (
    <div className="w-full h-full bg-white flex items-center justify-center">
      <div className="text-red-600 font-black italic animate-pulse">CONNECTING SATELLITE...</div>
    </div>
  );

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoomLevel}
        onLoad={(map) => { mapRef.current = map; }}
        onClick={() => setSelectedStore(null)}
        options={{
          disableDefaultUI: false,
          gestureHandling: 'greedy',
          mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID,
          styles: [] 
        }}
      >
        {stores.map((store, idx) => {
          const lat = Number(store.lat || store.Lat);
          const lng = Number(store.lng || store.Ing || store.Lng);
          if (isNaN(lat) || lat === 0) return null;

          return (
            <MarkerF
              key={`${store.id}-${idx}`}
              position={{ lat, lng }}
              onClick={() => {
                setSelectedStore(store);
                mapRef.current?.panTo({ lat, lng });
                mapRef.current?.setZoom(18); // 마커 클릭 시에는 여전히 확대되게 유지
              }}
              icon={{
                url: ICON_ASSETS[store.category?.toLowerCase()] || ICON_ASSETS.default,
                scaledSize: new window.google.maps.Size(42, 42),
                anchor: new window.google.maps.Point(21, 21),
              }}
              title={store.name}
              zIndex={String(store.id) === String(focusStoreId) ? 999 : 1}
            />
          );
        })}
      </GoogleMap>

      {/* 커뮤니티 페이지에서 마커 클릭 시 나오는 카드 */}
      {selectedStore && !focusStoreId && (
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
            <h4 className="text-xl font-black italic text-white mb-1 uppercase tracking-tighter">{selectedStore.name}</h4>
            <p className="text-gray-300 text-[10px] font-bold uppercase mb-4 tracking-tight leading-relaxed line-clamp-2">{selectedStore.address}</p>
            <button 
              onClick={() => navigate(`/store/${selectedStore.id}`)}
              className="w-full py-3.5 bg-red-600 text-white font-black italic uppercase text-xs rounded-2xl shadow-lg"
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
