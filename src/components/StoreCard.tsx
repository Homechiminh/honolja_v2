import React from 'react';
import { Link } from 'react-router-dom';
import { Store } from '../types';
import { SPRITE_IMAGE_URL_9, SPRITE_IMAGE_URL_12 } from '../constants';

interface StoreCardProps {
  store: Store;
}

const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  const isSprite9 = store.image_url === SPRITE_IMAGE_URL_9;
  const isSprite12 = store.image_url === SPRITE_IMAGE_URL_12;
  const isSprite = isSprite9 || isSprite12;

  const getSpriteStyle = () => {
    if (!isSprite) return {};
    const cols = 3;
    const index = store.image_index || 0;
    const x = (index % cols) * (100 / (cols - 1));
    const rows = isSprite9 ? 3 : 4;
    const y = Math.floor(index / cols) * (100 / (rows - 1));

    return {
      backgroundImage: `url(${store.image_url})`,
      backgroundSize: `${cols * 100}% ${rows * 100}%`,
      backgroundPosition: `${x}% ${y}%`,
    };
  };

  return (
    <Link to={`/store/detail/${store.id}`} className="bg-[#111] rounded-[24px] overflow-hidden border border-white/5 group hover:border-red-600/50 transition-all flex flex-col h-full shadow-2xl">
      <div className="aspect-[3/4] bg-neutral-900 relative overflow-hidden">
        {isSprite ? (
          <div style={getSpriteStyle()} className="w-full h-full group-hover:scale-110 transition-transform duration-700 opacity-80" />
        ) : (
          <img src={store.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-70" alt={store.name} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
        {store.is_hot && (
          <div className="absolute top-4 left-4 bg-red-600 text-[10px] font-black px-2 py-1 rounded shadow-lg uppercase tracking-tighter">Hot</div>
        )}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded flex items-center gap-1 border border-white/10">
          <span className="text-yellow-500 text-[10px]">★</span>
          <span className="text-[11px] font-bold text-white">{store.rating}</span>
        </div>
      </div>

      <div className="p-5 flex-grow flex flex-col">
        <div className="flex flex-wrap gap-1 mb-3">
          {store.tags?.map((tag: string) => (
            <span key={tag} className="text-[9px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded uppercase tracking-tighter">#{tag}</span>
          ))}
        </div>
        <h4 className="text-lg font-black mb-1 truncate group-hover:text-red-600 transition-colors tracking-tighter">{store.name}</h4>
        <p className="text-[11px] text-gray-500 mb-5 line-clamp-2 font-medium leading-relaxed">{store.description}</p>
        <div className="mt-auto w-full py-3 rounded-xl border border-white/10 text-center text-[10px] font-black tracking-widest uppercase group-hover:bg-red-600 group-hover:border-red-600 transition-all shadow-sm">
          View Details
        </div>
      </div>
    </Link>
  );
};

export default StoreCard;
