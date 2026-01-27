import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { Region } from '../types';
import type { Store } from '../types';
import StoreCard from '../components/StoreCard';

const DanangHome: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  // 다낭 데이터만 가져오기
  useEffect(() => {
    const fetchDanangStores = async () => {
      setLoading(false);
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('region', Region.DANANG) // 🔴 다낭 필터 고정
        .limit(8);

      if (!error && data) setStores(data as Store[]);
      setLoading(false);
    };
    fetchDanangStores();
  }, []);

  return (
    <div className="w-full bg-[#050505]">
      {/* Hero: 다낭 전용 비주얼 */}
      <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-blue-900/20 to-transparent">
        <div className="absolute inset-0 z-0 opacity-40">
           <img 
             src="https://images.unsplash.com/photo-1559592442-741e6b89cc3b?q=80&w=1200" 
             className="w-full h-full object-cover"
             alt="다낭 전경"
           />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <span className="text-blue-500 font-black text-xs md:text-sm uppercase tracking-[0.5em] block mb-6 animate-pulse">DANANG NOLA!</span>
          <h1 className="text-5xl md:text-9xl font-black text-white italic tracking-tighter leading-tight mb-8">
            DANANG <span className="text-blue-500">NEW WORLD</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-2xl font-medium leading-relaxed italic">
            미케비치의 낭만과 밤문화의 정점. <br /> 호놀자가 엄선한 다낭 파트너사 리스트.
          </p>
        </div>
      </section>

      {/* Categories: 다낭 전용 경로로 연결 */}
      <section className="container mx-auto px-4 -mt-20 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '마사지', icon: '💆', path: 'massage' },
            { label: '이발소', icon: '💈', path: 'barber' },
            { label: '가라오케', icon: '🎤', path: 'karaoke' },
            { label: '밤문화', icon: '🍸', path: 'barclub' }
          ].map((cat) => (
            <Link key={cat.path} to={`/danang/${cat.path}`} className="bg-[#111]/80 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] hover:border-blue-500/50 transition-all group text-center shadow-2xl">
              <span className="text-3xl md:text-5xl block mb-4 group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-white font-black text-sm md:text-lg italic uppercase">다낭 {cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* HOT SPOT: 다낭 업장만 노출 */}
      <section className="container mx-auto px-4 py-24">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase">
            DANANG <span className="text-blue-500">HOT SPOT</span>
          </h2>
          <Link to="/danang/massage" className="text-slate-500 font-bold hover:text-white transition-colors uppercase italic text-xs tracking-widest">View All</Link>
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
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-[3rem] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden">
          <div className="relative z-10 text-center md:text-left mb-10 md:mb-0">
             <h3 className="text-3xl md:text-5xl font-black text-white mb-4 italic tracking-tighter uppercase">DANANG COMMUNITY</h3>
             <p className="text-white/80 font-medium text-lg italic">다낭 현지의 생생한 소식과 후기를 만나보세요.</p>
          </div>
          <Link to="/community" className="relative z-10 px-12 py-5 bg-white text-black rounded-2xl font-black text-xl hover:scale-105 transition-transform shadow-xl uppercase italic">
            Board
          </Link>
        </div>
      </section>
    </div>
  );
};

export default DanangHome;
