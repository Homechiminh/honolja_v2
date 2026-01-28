import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Store } from '../types';

interface StoreCardProps { 
  store: Store; 
}

// 🔴 고정 스프라이트 URL
const SPRITE_9_URL = "https://res.cloudinary.com/dtkfzuyew/image/upload/v1768906189/Gemini_Generated_Image_12t6r212t6r212t6_fyruur.png";
const SPRITE_12_URL = "https://res.cloudinary.com/dtkfzuyew/image/upload/v1768960502/lucid-origin_9_asian_girls_with_well_dressed_such_as_Sequin_Dress_off_shoulder_dress_Slip_Dre-0_2_kuf0m2.jpg";

const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  // 1. 모델 중심 업소인지 확인 (마사지, 이발소, 가라오케, 클럽)
  const isModelType = ['massage', 'barber', 'karaoke', 'barclub'].includes(store.category);

  // 2. 카테고리에 따른 설명 라벨 결정 (Stays, Vehicle 등)
  const categoryLabel = useMemo(() => {
    switch (store.category) {
      case 'villa': return 'Premium Stays';
      case 'vehicle': return 'Premium Vehicle';
      case 'tour': return 'Premium Tour';
      case 'visa_guide': return 'Travel Service';
      default: return 'Premium Selection';
    }
  }, [store.category]);

  // 3. 스프라이트 설정 계산
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
        
        {/* 이미지 노출 분기 */}
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
            src={store.image_url} 
            alt={store.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90"></div>
        
        {/* 상단 뱃지 */}
        <div className="absolute top-4 left-4 z-20">
          {store.is_hot && (
            <div className="bg-red-600 text-white text-[8px] md:text-[10px] font-black px-2 py-0.5 rounded shadow-lg animate-pulse uppercase italic">Hot</div>
          )}
        </div>

        <div className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
          <span className="text-[10px] text-white font-black">⭐ {store.rating || '4.5'}</span>
        </div>

        {/* 하단 정보 레이어 */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 z-30">
          <h3 className="text-lg md:text-2xl font-black text-white mb-1 tracking-tighter group-hover:text-red-500 transition-colors uppercase italic leading-none">
            {store.name}
          </h3>
          <p className="text-[10px] md:text-[11px] text-slate-400 line-clamp-1 mb-4 font-medium opacity-80 italic">
            {store.description}
          </p>
          
          {/* 하단 버튼 및 라벨 영역 */}
          <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-2">
            <div className="flex flex-col">
              <span className="text-red-600 font-black text-[8px] uppercase italic tracking-widest">Verified Service</span>
              <span className="text-white font-black italic text-[11px] uppercase tracking-tighter">{categoryLabel}</span>
            </div>
            {/* 🔴 모든 카테고리 예약 버튼 통일 */}
            <div className="bg-red-600 text-white text-[10px] font-black px-4 py-2 rounded-xl shadow-lg shadow-red-600/20 group-hover:bg-white group-hover:text-red-600 transition-all uppercase italic">
              예약문의
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StoreCard;
