import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Store } from '../types';

interface StoreCardProps { 
  store: Store; 
}

const SPRITE_9_URL = "https://res.cloudinary.com/dtkfzuyew/image/upload/v1768906189/Gemini_Generated_Image_12t6r212t6r212t6_fyruur.png";
const SPRITE_12_URL = "https://res.cloudinary.com/dtkfzuyew/image/upload/v1768960502/lucid-origin_9_asian_girls_with_well_dressed_such_as_Sequin_Dress_off_shoulder_dress_Slip_Dre-0_2_kuf0m2.jpg";

const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  const isModelType = ['massage', 'barber', 'karaoke', 'barclub'].includes(store.category);

  const spriteConfig = useMemo(() => {
    const index = store.image_index || 0;
    if (index < 9) {
      return { url: SPRITE_9_URL, cols: 3, rows: 3, size: '300% 300%', localIndex: index };
    }
    return { url: SPRITE_12_URL, cols: 4, rows: 3, size: '400% 300%', localIndex: index - 9 };
  }, [store.image_index]);

  const backgroundPosition = useMemo(() => {
    const { cols, rows, localIndex } = spriteConfig;
    const col = localIndex % cols;
    const row = Math.floor(localIndex / cols);
    const x = cols > 1 ? (col / (cols - 1)) * 100 : 0; 
    const y = rows > 1 ? (row / (rows - 1)) * 100 : 0; 
    return `${x}% ${y}%`;
  }, [spriteConfig]);

  return (
    <Link 
      to={`/store/${store.id}`} 
      className="group relative bg-[#0a0a0a] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-red-600 transition-all duration-500 shadow-2xl block"
    >
      <div className="relative aspect-[3/4.2] overflow-hidden bg-black">
        {/* 이미지 영역 */}
        {isModelType ? (
          <div 
            className="absolute inset-0 w-full h-full transition-transform duration-1000 group-hover:scale-110"
            style={{
              backgroundImage: `url('${spriteConfig.url}')`,
              backgroundSize: spriteConfig.size,
              backgroundPosition: backgroundPosition,
              backgroundRepeat: 'no-repeat',
            }}
          />
        ) : (
          <img 
            src={store.image_url || 'https://via.placeholder.com/400x600?text=No+Image'} 
            alt={store.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            loading="lazy"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-95"></div>
        
        {/* 상단 배지 및 별점 */}
        <div className="absolute top-4 left-4 z-20">
          {store.is_hot && (
            <div className="bg-red-600 text-white text-[8px] md:text-[10px] font-black px-2 py-0.5 rounded shadow-lg animate-pulse uppercase italic tracking-tighter">Hot</div>
          )}
        </div>

        <div className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
          <span className="text-[10px] text-white font-black italic">
            ⭐ {(store.rating ?? 4.5).toFixed(1)}
          </span>
        </div>

        {/* 하단 정보 레이어 */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 z-30">
          
          {/* ✅ 제목: 기본 빨간색 + 호버 시 흰색 글로우 효과 */}
          <h3 className="text-xl md:text-2xl font-black text-red-500 mb-2 tracking-tighter uppercase italic leading-none truncate transition-all duration-300 group-hover:text-white group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
            {store.name}
          </h3>
          
          {/* 설명글: 흰색 볼드 */}
          <p className="text-[11px] md:text-[13px] text-white line-clamp-1 mb-4 font-bold italic tracking-tight opacity-100">
            {store.description || '호놀자가 보증하는 프리미엄 서비스입니다.'}
          </p>

          {/* 빌라 전용 가격 표시 */}
          {store.category === 'villa' && store.price && (
            <div className="mb-4">
              <span className="text-red-500 font-black text-base md:text-xl italic tracking-tighter">
                {store.price} <span className="text-[10px] md:text-xs opacity-70 text-white">/ 박</span>
              </span>
            </div>
          )}
          
          {/* 하단 라인: 제휴 마크 & 예약문의 버튼 */}
          <div className="flex justify-between items-center border-t border-white/20 pt-4 mt-2 gap-2">
            <div className="flex-shrink-0">
              <div className="border border-red-600/50 bg-red-600/10 px-2.5 py-1 rounded-full backdrop-blur-sm shadow-[0_0_10px_rgba(220,38,38,0.1)]">
                <span className="text-red-500 font-black italic text-[9px] md:text-[11px] uppercase tracking-tighter whitespace-nowrap">
                  호놀자 제휴
                </span>
              </div>
            </div>

            <div className="bg-red-600 text-white text-[10px] md:text-[11px] font-black px-3 md:px-4 py-2 rounded-xl shadow-lg shadow-red-900/40 group-hover:bg-white group-hover:text-red-600 transition-all uppercase italic active:scale-95 whitespace-nowrap flex-shrink-0">
              예약문의
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StoreCard;
