import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; // 🔴 SEO용 추가
import { supabase } from '../supabase';
import { Region } from '../types';
import type { Store } from '../types';
import StoreCard from '../components/StoreCard';
import { useAuth } from '../contexts/AuthContext'; 
import { useFetchGuard } from '../hooks/useFetchGuard'; 

const NhatrangHome: React.FC = () => {
  // 1. 전역 인증 상태 구독
  const { loading: authLoading } = useAuth();

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * 🔴 [방탄 fetch] 나트랑 전용 업소 데이터 로드
   */
  const fetchNhatrangStores = async () => {
    setLoading(true); 
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('region', Region.NHA_TRANG) 
        .limit(8);

      if (error) {
        throw error;
      }

      if (data) {
        setStores(data as Store[]);
      }
    } catch (err: any) {
      console.error("나트랑 데이터 동기화 실패 (406 등):", err.message);
      setStores([]); 
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔴 [데이터 가드 적용] 
   */
  useFetchGuard(fetchNhatrangStores, []);

  // 2. 전체 로딩 가드
  if (authLoading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="w-full bg-[#050505] selection:bg-emerald-600/30 font-sans">
      {/* 🔴 SEO 최적화 Helmet 섹션 */}
      <Helmet>
        <title>호놀자 나트랑 | 나트랑 유흥 · 밤문화 · 마사지 · 가라오케 완벽 가이드</title>
        <meta name="description" content="동양의 나폴리 나트랑의 모든 것! 나트랑 마사지, 가라오케, 밤문화, 이발소 등 호놀자가 직접 검증한 핫플레이스 정보와 실시간 후기를 확인하세요." />
        <meta name="keywords" content="나트랑여행, 나트랑 유흥, 나트랑 밤문화, 베트남여행, 베트남 여자, 나트랑 가라오케, 나트랑 마사지, 나트랑 불건, 나트랑 이발소, 나트랑 클럽, 나트랑 자유여행" />
        
        {/* Open Graph (SNS 공유 최적화) */}
        <meta property="og:title" content="나트랑 NEW WORLD - 호놀자 프리미엄 가이드" />
        <meta property="og:description" content="나트랑 여행의 모든 즐거움, 검증된 업소 정보와 특별 혜택을 호놀자에서 만나보세요." />
        <meta property="og:image" content="https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=1200" />
        <meta property="og:url" content="https://honolja.com/nhatrang" />
      </Helmet>

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
          <span className="text-emerald-500 font-black text-xs md:text-sm uppercase tracking-[0.5em] block mb-6 animate-pulse italic">NHA TRANG INTELLIGENCE</span>
          <h1 className="text-5xl md:text-9xl font-black text-white italic tracking-tighter leading-tight mb-8 uppercase">
            NHA TRANG <span className="text-emerald-500">NEW WORLD</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-2xl font-medium leading-relaxed italic">
            동양의 나폴리, 완벽한 휴양의 도시. <br /> 호놀자가 직접 확인한 나트랑의 핫플레이스.
          </p>
        </div>
      </section>

      {/* Categories */}
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
              <span className="text-white font-black text-sm md:text-lg italic uppercase tracking-tighter">나트랑 {cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* HOT SPOT: 나트랑 업장 리스트 */}
      <section className="container mx-auto px-4 py-24">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
            NHA TRANG <span className="text-emerald-500">HOT SPOT</span>
          </h2>
          <Link to="/nhatrang/massage" className="text-slate-500 font-bold hover:text-white transition-colors uppercase italic text-xs tracking-widest border-b border-transparent hover:border-white pb-1">View Archive</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[1,2,3,4].map(n => <div key={n} className="aspect-[3/4] bg-white/5 animate-pulse rounded-[2rem]"></div>)}
          </div>
        ) : stores.length === 0 ? (
          <div className="py-32 text-center bg-[#111] rounded-[3.5rem] border border-dashed border-white/5 animate-in fade-in duration-500">
            <p className="text-gray-600 font-black italic uppercase tracking-widest text-xs">No Records Found in Nha Trang Sector.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 animate-in fade-in duration-700">
            {stores.map(store => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        )}
      </section>

      {/* Community Banner */}
      <section className="container mx-auto px-4 pb-32">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-[3rem] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
          <div className="relative z-10 text-center md:text-left mb-10 md:mb-0">
             <h3 className="text-3xl md:text-5xl font-black text-white mb-4 italic tracking-tighter uppercase">NHA TRANG COMMUNITY</h3>
             <p className="text-white/80 font-medium text-lg italic uppercase tracking-tight">나트랑 여행자들과의 실시간 정보 공유 및 기밀 데이터</p>
          </div>
          <Link to="/community" className="relative z-10 px-12 py-5 bg-white text-black rounded-2xl font-black text-xl hover:scale-105 transition-transform shadow-xl uppercase italic active:scale-95">
            Access Board
          </Link>
        </div>
      </section>
    </div>
  );
};

export default NhatrangHome;
