import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Store } from '../types';

interface StoreCardProps { 
  store: Store; 
}

// 🔴 사용할 스프라이트 이미지 URL 정의
const SPRITE_9 = 'https://tqscfshshsh.supabase.co/storage/v1/object/public/stores/Gemini_Generated_Image.jpg'; // 3x3
const SPRITE_12 = 'https://tqscfshshsh.supabase.co/storage/v1/object/public/stores/lucid-origin.jpg'; // 4x3

const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  // 1. 이미지 결정 로직 (DB에 이미지가 있으면 사용, 없으면 스프라이트 할당)
  const displayImage = useMemo(() => {
    if (store.image_url && store.image_url.startsWith('http')) {
      return store.image_url;
    }
    // ID의 마지막 숫자를 이용해 9등분과 12등분 중 하나 선택
    const idNum = store.id.replace(/[^0-9]/g, '');
    const lastDigit = idNum ? parseInt(idNum.slice(-1)) : 0;
    return lastDigit % 2 === 0 ? SPRITE_9 : SPRITE_12;
  }, [store.image_url, store.id]);

  // 2. 스프라이트 판별 및 설정
  const isSprite = useMemo(() => {
    return displayImage.includes('Gemini_Generated_Image') || displayImage.includes('lucid-origin');
  }, [displayImage]);

  const spriteConfig = useMemo(() => {
    if (!isSprite) return null;
    // 12등분 이미지(lucid-origin)인 경우
    if (displayImage.includes('lucid-origin')) {
      return { cols: 4, rows: 3, size: '400% 300%' };
    }
    // 9등분 이미지(Gemini)인 경우
    return { cols: 3, rows: 3, size: '300% 300%' };
  }, [displayImage, isSprite]);

  // 3. 배경 위치 계산 (업소 ID를 기반으로 랜덤 위치 지정)
  const backgroundPosition = useMemo(() => {
    if (!spriteConfig) return 'center';
    const { cols, rows } = spriteConfig;
    // ID를 숫자로 변환해 인덱스 결정
    const idHash = store.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = idHash % (cols * rows);
    
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = cols > 1 ? (col / (cols - 1)) * 100 : 0; 
    const y = rows > 1 ? (row / (rows - 1)) * 100 : 0; 
    return `${x}% ${y}%`;
  }, [store.id, spriteConfig]);

  return (
    <Link to={`/store/detail/${store.id}`} className="group relative bg-[#0a0a0a] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-red-600 transition-all duration-500 shadow-2xl cursor-pointer">
      <div className="relative aspect-[3/4.2] overflow-hidden bg-black">
        <div 
          className="absolute inset-0 w-full h-full transition-transform duration-1000 group-hover:scale-110"
          style={{
            backgroundImage: `url('${displayImage}')`,
            backgroundSize: isSprite ? spriteConfig?.size : 'cover',
            backgroundPosition: isSprite ? backgroundPosition : 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90 transition-opacity"></div>
        
        {/* 상단 HOT/별점 레이어 */}
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
          <div className="flex flex-wrap gap-1.5 mb-2">
            {store.tags?.slice(0, 2).map(tag => (
              <span key={tag} className="text-[7px] md:text-[9px] text-red-500 font-bold uppercase tracking-wider border border-red-500/30 px-2 py-0.5 rounded bg-black/60">
                #{tag}
              </span>
            ))}
          </div>
          <h3 className="text-lg md:text-2xl font-black text-white mb-1 tracking-tighter group-hover:text-red-500 transition-colors uppercase italic">
            {store.name}
          </h3>
          <p className="text-[10px] md:text-[11px] text-slate-400 line-clamp-1 mb-4 font-medium opacity-80 italic">
            {store.description}
          </p>
          <div className="flex items-center space-x-2 text-white font-black text-[10px] uppercase tracking-[0.2em] group-hover:text-red-600 transition-all italic">
             <div className="h-[1.5px] w-5 bg-red-600 group-hover:w-10 transition-all duration-500"></div>
             <span>View Details</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StoreCard;
