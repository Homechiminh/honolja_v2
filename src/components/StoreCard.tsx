import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Store } from '../types';

interface StoreCardProps { 
  store: Store; 
}

const SPRITE_9_URL = "https://res.cloudinary.com/dtkfzuyew/image/upload/v1768906189/Gemini_Generated_Image_12t6r212t6r212t6_fyruur.png";
const SPRITE_12_URL = "https://res.cloudinary.com/dtkfzuyew/image/upload/v1768960502/lucid-origin_9_asian_girls_with_well_dressed_such_as_Sequin_Dress_off_shoulder_dress_Slip_Dre-0_2_kuf0m2.jpg";

const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  // 1. 모델 타입 여부 판별 (스프라이트 사용 카테고리)
  const isModelType = ['massage', 'barber', 'karaoke', 'barclub'].includes(store.category);

  // 2. 카테고리 라벨 메모이제이션 (디자인 유지)
  const categoryLabel = useMemo(() => {
    switch (store.category) {
      case 'villa': return 'Premium Stays';
      case 'vehicle': return 'Premium Vehicle';
      case 'tour': return 'Premium Tour';
      case 'visa_guide': return 'Travel Service';
      default: return 'Premium Selection';
    }
  }, [store.category]);

  /**
   * 🔴 [스프라이트 엔진] 9구와 12구 이미지를 인덱스에 따라 자동 스위칭
   */
  const spriteConfig = useMemo(() => {
    const index = store.image_index || 0;
    if (index < 9) {
      return { url: SPRITE_9_URL, cols: 3, rows: 3, size: '300% 300%', localIndex: index };
    }
    return { url: SPRITE_12_URL, cols: 4, rows: 3, size: '400% 300%', localIndex: index - 9 };
  }, [store.image_index]);

  // 3. 배경 좌표 계산 (CSS % 방식)
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

        {/* 오버레이 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90"></div>
        
        {/* HOT 배지 */}
        <div className="absolute top-4 left-4 z-20">
          {store.is_hot && (
            <div className="bg-red-600 text-white text-[8px] md:text-[10px] font-black px-2 py-0.5 rounded shadow-lg animate-pulse uppercase italic tracking-tighter">Hot</div>
          )}
        </div>

        {/* 별점 표시 */}
        <div className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
          <span className="text-[10px] text-white font-black italic">
            ⭐ {(store.rating ?? 4.5).toFixed(1)}
          </span>
        </div>

        {/* 하단 텍스트 정보 */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 z-30">
          <h3 className="text-lg md:text-2xl font-black text-white mb-1 tracking-tighter group-hover:text-red-500 transition-colors uppercase italic leading-none truncate">
            {store.name}
          </h3>
          <p className="text-[10px] md:text-[11px] text-slate-400 line-clamp-1 mb-3 font-medium opacity-80 italic tracking-tight">
            {store.description || '호놀자가 보증하는 프리미엄 서비스입니다.'}
          </p>

          {/* 🔴 빌라(VILLA) 카테고리일 때 가격 표시 추가 */}
          {store.category === 'villa' && store.price && (
            <div className="mb-4">
              <span className="text-red-500 font-black text-sm md:text-lg italic tracking-tighter">
                {store.price} <span className="text-[10px] md:text-xs opacity-70">/ 박</span>
              </span>
            </div>
          )}
          
          <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-2">
            <div className="flex flex-col">
              <span className="text-red-600 font-black text-[8px] uppercase italic tracking-[0.2em]">Verified Service</span>
              <span className="text-white font-black italic text-[11px] uppercase tracking-tighter">{categoryLabel}</span>
            </div>
            <div className="bg-red-600 text-white text-[10px] font-black px-4 py-2 rounded-xl shadow-lg shadow-red-900/40 group-hover:bg-white group-hover:text-red-600 transition-all uppercase italic active:scale-95">
              예약문의
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StoreCard;
