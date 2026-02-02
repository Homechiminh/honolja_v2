import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { Region } from '../types';
import type { Store } from '../types';
import StoreCard from '../components/StoreCard';
import { useAuth } from '../contexts/AuthContext'; 
import { useFetchGuard } from '../hooks/useFetchGuard'; 

const DanangHome: React.FC = () => {
  // 1. 전역 인증 상태 구독
  const { loading: authLoading } = useAuth();

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * 🔴 [방탄 fetch] 다낭 지역 데이터 로드
   * 어떤 네트워크 거절(406)이나 지연이 발생해도 finally 블록이 로딩을 확실히 종료합니다.
   */
  const fetchDanangStores = async () => {
    setLoading(true); // 로딩 시작
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('region', Region.DANANG) 
        .limit(8);

      if (error) {
        // 🔴 서버 에러 발생 시 즉시 catch 블록으로 이동
        throw error;
      }

      if (data) {
        setStores(data as Store[]);
      }
    } catch (err: any) {
      console.error("다낭 데이터 동기화 실패 (406 등):", err.message);
      // 에러 시 빈 리스트로 초기화하여 안정성 확보
      setStores([]); 
    } finally {
      // 🔴 핵심: 성공하든 실패하든 무조건 로딩 상태 해제
      setLoading(false);
    }
  };

  /**
   * 🔴 [데이터 가드 적용] 
   * 인증 확인이 끝난 최적의 타이밍에 다낭 데이터를 호출합니다.
   */
  useFetchGuard(fetchDanangStores, []);

  // 2. 전체 로딩 가드 (다낭 전용 블루 테마 스피너)
  if (authLoading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="w-full bg-[#050505] selection:bg-blue-600/30 font-sans">
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
          <span className="text-blue-500 font-black text-xs md:text-sm uppercase tracking-[0.5em] block mb-6 animate-pulse italic">DANANG INTELLIGENCE</span>
          <h1 className="text-5xl md:text-9xl font-black text-white italic tracking-tighter leading-tight mb-8 uppercase">
            DANANG <span className="text-blue-500">NEW WORLD</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-2xl font-medium leading-relaxed italic">
            미케비치의 낭만과 밤문화의 정점. <br /> 호놀자가 직접 확인한 다낭 파트너사 리스트.
          </p>
        </div>
      </section>

      {/* Categories: 다낭 전용 경로 */}
      <section className="container mx-auto px-4 -mt-20 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '마사지', icon: '💆', path: 'massage' },
            { label: '이발소', icon: '💈', path: 'barber' },
            { label: '가라오케', icon: '🎤', path: 'karaoke' },
            { label: '밤문화', icon: '🍸', path: 'barclub' }
          ].map((cat) => (
            <Link key={cat.path} to={`/danang/${cat.path}`} className="bg-[#111]/80 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] hover:border-blue-500/50 transition-all group text-center shadow-2xl">
              <span className="text-3xl md:text-5xl block mb-4 group-hover:scale-110 transition-transform duration-500">{cat.icon}</span>
              <span className="text-white font-black text-sm md:text-lg italic uppercase tracking-tighter">다낭 {cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* HOT SPOT: 다낭 업장 리스트 */}
      <section className="container mx-auto px-4 py-24">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
            DANANG <span className="text-blue-500">HOT SPOT</span>
          </h2>
          <Link to="/danang/massage" className="text-slate-500 font-bold hover:text-white transition-colors uppercase italic text-xs tracking-widest border-b border-transparent hover:border-white pb-1 transition-all">View Archive</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[1,2,3,4].map(n => <div key={n} className="aspect-[3/4] bg-white/5 animate-pulse rounded-[2rem]"></div>)}
          </div>
        ) : stores.length === 0 ? (
          <div className="py-32 text-center bg-[#111] rounded-[3.5rem] border border-dashed border-white/5 animate-in fade-in duration-500">
            <p className="text-gray-600 font-black italic uppercase tracking-widest text-xs">No Records Found in Danang Sector.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 animate-in fade-in duration-1000">
            {stores.map(store => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        )}
      </section>

      {/* Community Banner */}
      <section className="container mx-auto px-4 pb-32">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-[3rem] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
          <div className="relative z-10 text-center md:text-left mb-10 md:mb-0">
             <h3 className="text-3xl md:text-5xl font-black text-white mb-4 italic tracking-tighter uppercase leading-none">DANANG COMMUNITY</h3>
             <p className="text-white/80 font-medium text-lg italic uppercase tracking-tight">다낭 현지의 생생한 기밀 정보와 대원들의 리얼 후기</p>
          </div>
          <Link to="/community" className="relative z-10 px-12 py-5 bg-white text-black rounded-2xl font-black text-xl hover:scale-105 transition-transform shadow-xl uppercase italic active:scale-95">
            Access Board
          </Link>
        </div>
      </section>
    </div>
  );
};

export default DanangHome;
