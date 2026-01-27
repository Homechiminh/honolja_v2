import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { Region } from '../types';
import type { Store } from '../types';
import StoreCard from '../components/StoreCard';

const NhatrangHome: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  // 나트랑 데이터만 가져오기
  useEffect(() => {
    const fetchNhatrangStores = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('region', Region.NHA_TRANG) // 🔴 나트랑 필터 고정
        .limit(8);

      if (!error && data) setStores(data as Store[]);
      setLoading(false);
    };
    fetchNhatrangStores();
  }, []);

  return (
    <div className="w-full bg-[#050505]">
      {/* Hero: 나트랑 전용 비주얼 */}
      <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-emerald-900/20 to-transparent">
        <div className="absolute inset-0 z-0 opacity-40">
           <img 
             src="https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=1200" 
             className="w-full h-full object-cover"
             alt="나트랑 전경"
           />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <span className="text-emerald-500 font-black text-xs md:text-sm uppercase tracking-[0.5em] block mb-6 animate-pulse">NHA TRANG NOLA!</span>
          <h1 className="text-5xl md:text-9xl font-black text-white italic tracking-tighter leading-tight mb-8 uppercase">
            NHA TRANG <span className="text-emerald-500">NEW WORLD</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-2xl font-medium leading-relaxed italic">
            동양의 나폴리, 완벽한 휴양의 도시. <br /> 호놀자가 직접 확인한 나트랑의 핫플레이스.
          </p>
        </div>
      </section>

      {/* Categories: 나트랑 전용 경로로 연결 */}
      <section className="container mx-auto px-4 -mt-20 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '마사지', icon: '💆', path: 'massage' },
            { label: '이발소', icon: '💈', path: 'barber' },
            { label: '가라오케', icon: '🎤', path: 'karaoke' },
            { label: '밤문화', icon: '🍸', path: 'barclub' }
          ].map((cat) => (
            <Link key={cat.path} to={`/nhatrang/${cat.path}`} className="bg-[#111]/80 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] hover:border-emerald-500/50 transition-all group text-center shadow-2xl">
              <span className="text-3xl md:text-5xl block mb-4 group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-white font-black text-sm md:text-lg italic uppercase">나트랑 {cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* HOT SPOT: 나트랑 업장만 노출 */}
      <section className="container mx-auto px-4 py-24">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase">
            NHA TRANG <span className="text-emerald-500">HOT SPOT</span>
          </h2>
          <Link to="/nhatrang/massage" className="text-slate-500 font-bold hover:text-white transition-colors uppercase italic text-xs tracking-widest">View All</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[1,2,3,4].map(n => <div key={n} className="aspect-[3/4] bg-white/5 animate-pulse rounded-[2rem]"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stores.map(store => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        )}
      </section>

      {/* Community */}
      <section className="container mx-auto px-4 pb-32">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-[3rem] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between shadow-2xl overflow-hidden relative">
          <div className="relative z-10 text-center md:text-left mb-10 md:mb-0">
             <h3 className="text-3xl md:text-5xl font-black text-white mb-4 italic tracking-tighter uppercase">NHA TRANG COMMUNITY</h3>
             <p className="text-white/80 font-medium text-lg italic">나트랑 여행자들과의 실시간 정보 공유.</p>
          </div>
          <Link to="/community" className="relative z-10 px-12 py-5 bg-white text-black rounded-2xl font-black text-xl hover:scale-105 transition-transform shadow-xl uppercase italic">
            Board
          </Link>
        </div>
      </section>
    </div>
  );
};

export default NhatrangHome;
