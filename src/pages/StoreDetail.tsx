import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext'; 
import { SNS_LINKS } from '../constants';
import { UserRole } from '../types'; 
import type { Store } from '../types';

const StoreDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, initialized } = useAuth(); 

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔴 isAdmin 변수 활용 (에러 해결)
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const fetchStoreDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) setStore(data as Store);
    } catch (err: any) {
      console.error("Store Sync Failed:", err.message);
      setStore(null);
    } finally {
      setLoading(false);
    }
  };

  // 비로그인 접근 허용을 위해 initialized 시점에 데이터 로드
  useEffect(() => {
    if (initialized) {
      fetchStoreDetail();
    }
  }, [id, initialized]);

  // 🔴 handleDelete 함수 UI 연결 (에러 해결)
  const handleDelete = () => {
    if (window.confirm('관리자 권한으로 이 업소를 삭제하시겠습니까? 데이터는 복구되지 않습니다.')) {
      alert('삭제 처리는 관리자 대시보드(Manage Stores) 메뉴를 이용해 주세요.');
    }
  };

  const spriteConfig = useMemo(() => {
    if (!store) return { cols: 1, rows: 1, size: 'cover' };
    if (store.image_url?.includes('supabase.co')) return { cols: 1, rows: 1, size: 'cover' };
    if (store.image_url?.includes('kuf0m2')) return { cols: 4, rows: 3, size: '400% 300%' };
    return { cols: 3, rows: 3, size: '300% 300%' };
  }, [store]);

  const backgroundPosition = useMemo(() => {
    if (!store || spriteConfig.size === 'cover') return 'center';
    const { cols, rows } = spriteConfig;
    const col = (store.image_index || 0) % cols;
    const row = Math.floor((store.image_index || 0) / cols);
    const x = cols > 1 ? (col / (cols - 1)) * 100 : 0;
    const y = rows > 1 ? (row / (rows - 1)) * 100 : 0;
    return `${x}% ${y}%`;
  }, [store, spriteConfig]);

  const mapUrl = useMemo(() => {
    if (!store?.address) return "";
    return `https://maps.google.com/maps?q=${encodeURIComponent(store.address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  }, [store?.address]);

  if (!initialized || loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-red-600 italic animate-pulse uppercase font-black">
      Syncing Intelligence...
    </div>
  );

  if (!store) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-center px-6">
      <div>
        <p className="text-white font-black italic uppercase text-2xl mb-6 tracking-tighter">Target Not Found</p>
        <button onClick={() => navigate(-1)} className="text-red-600 font-bold uppercase text-xs border-b border-red-600 pb-1">Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] font-sans selection:bg-red-600/30 text-white">
      <Helmet>
        <title>호놀자 | {store.name} - 호치민 {store.category} 정보</title>
        <meta name="description" content={`${store.name} - ${store.region} 추천 업소. 호놀자 보고 연락 시 제휴 혜택 제공.`} />
        <meta name="keywords" content={`베트남여행, 호치민여행, 호치민 밤문화, ${store.name}, ${store.category}`} />
      </Helmet>

      {/* Hero Header - UI 축소 버전 (h-40vh) */}
      <div className="relative h-[40vh] md:h-[55vh] w-full overflow-hidden bg-black">
        <div 
          className="absolute inset-0 w-full h-full opacity-60"
          style={{
            backgroundImage: `url('${store.image_url}')`,
            backgroundSize: spriteConfig.size,
            backgroundPosition: backgroundPosition,
            filter: 'blur(15px)',
            transform: 'scale(1.1)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-[#050505]"></div>
        
        <div className="container mx-auto px-6 h-full flex items-end pb-8 relative z-10">
          <div className="flex flex-col md:flex-row items-end gap-8 w-full">
            <div className="w-40 h-56 md:w-52 md:h-72 rounded-[2rem] overflow-hidden border-4 border-white/10 shadow-2xl shrink-0">
               <div 
                 className="w-full h-full"
                 style={{
                   backgroundImage: `url('${store.image_url}')`,
                   backgroundSize: spriteConfig.size,
                   backgroundPosition: backgroundPosition,
                 }}
               />
            </div>
            <div className="flex-grow pb-2 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                <span className="bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest italic">Premium {store.category}</span>
                <span className="text-white/40 text-xs font-bold uppercase tracking-tighter italic">{store.region} • VIETNAM</span>
                
                {/* 🔴 isAdmin 활용 (에러 해결 및 기능 노출) */}
                {isAdmin && (
                  <button onClick={handleDelete} className="bg-red-600/20 text-red-500 border border-red-600/30 px-4 py-1 rounded-full text-[9px] font-black hover:bg-red-600 hover:text-white transition-all uppercase italic">Admin: Delete Mode</button>
                )}
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter italic leading-none uppercase">{store.name}</h1>
              
              {/* 🔴 split 에러 해결: tags 타입 방어 로직 */}
              {store.tags && (
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                  {(typeof store.tags === 'string' ? (store.tags as string).split(',') : (Array.isArray(store.tags) ? store.tags : [])).map((tag: string, i: number) => (
                    <span key={i} className="text-red-500 text-[11px] font-black italic">#{tag.trim()}</span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-center md:justify-start space-x-2 text-white font-black italic">
                <span className="text-yellow-500 text-2xl">★</span>
                <span className="text-2xl tracking-tighter">{(store.rating ?? 4.5).toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 z-30 p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-white/10 shadow-2xl transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-16">
            <section className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-[2.5rem] p-8 md:p-10 border border-red-600/20 shadow-2xl">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                </div>
                <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">호놀자 전용 멤버십 혜택</h3>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(store.benefits && store.benefits.length > 0 ? store.benefits : ["호놀자 회원 특별 할인가 제공", "예약 시 대기 시간 최소화"]).map((benefit, i) => (
                  <li key={i} className="flex items-center space-x-3 bg-white/[0.03] p-5 rounded-2xl border border-white/5 group hover:bg-red-600/5 transition-colors">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                    <span className="text-slate-300 font-bold italic tracking-tight text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-black text-white mb-6 italic uppercase tracking-tighter flex items-center">
                <div className="w-1 h-5 bg-red-600 mr-3 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
                Store Information
              </h3>
              <div className="bg-[#0f0f0f] rounded-[2rem] p-8 border border-white/5">
                <p className="text-slate-400 text-base md:text-lg leading-relaxed font-medium whitespace-pre-line italic">{store.description}</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-black text-white mb-8 italic uppercase tracking-tighter flex items-center">
                <div className="w-1 h-5 bg-red-600 mr-3 rounded-full"></div>
                Interior Gallery
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {(store.promo_images && store.promo_images.length > 0 ? store.promo_images : [store.image_url]).map((img, i) => (
                  <div key={i} className="aspect-[16/10] rounded-[2rem] overflow-hidden border-2 border-white/5 shadow-xl">
                    <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-xl font-black text-white mb-6 italic uppercase tracking-tighter flex items-center">
                <div className="w-1 h-5 bg-red-600 mr-3 rounded-full"></div>
                Our Location
              </h3>
              <div className="bg-[#0f0f0f] rounded-[2.5rem] p-8 border border-white/5 space-y-6">
                <div className="bg-black/50 px-6 py-4 rounded-xl border border-white/5">
                  <p className="text-white font-black italic text-base tracking-tight">{store.address}</p>
                </div>
                <div className="h-[350px] md:h-[450px] bg-slate-900 rounded-[2rem] overflow-hidden border-2 border-white/5">
                   <iframe title="store-location" width="100%" height="100%" frameBorder="0" style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' }} src={mapUrl} allowFullScreen></iframe>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar - 문구 수정 반영 */}
          <div className="space-y-6">
             <div className="sticky top-28 bg-white rounded-[2.5rem] p-10 text-black shadow-2xl">
                <span className="text-red-600 font-black text-[10px] uppercase tracking-[0.2em] block mb-2 italic">Exclusive Reservation</span>
                <h4 className="text-2xl font-black mb-6 tracking-tighter italic uppercase leading-none">실시간 예약 및 문의</h4>
                <div className="space-y-3">
                  <a href={store.kakao_url || SNS_LINKS.kakao} target="_blank" rel="noreferrer" className="w-full py-5 bg-[#FAE100] text-[#3C1E1E] rounded-2xl font-black text-center block hover:bg-[#F2D800] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 shadow-lg group">
                    <span className="uppercase tracking-tighter italic text-xs">KakaoTalk Reservation</span>
                  </a>
                  <a href={store.telegram_url || SNS_LINKS.telegram} target="_blank" rel="noreferrer" className="w-full py-5 bg-[#0088CC] text-white rounded-2xl font-black text-center block hover:bg-[#007AB8] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 shadow-lg group">
                    <span className="uppercase tracking-tighter italic text-xs">Telegram Inquiry</span>
                  </a>
                </div>
                
                <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                  <p className="text-[10px] text-slate-500 font-black uppercase leading-relaxed italic tracking-tighter">
                    호놀자 보고 연락했다고 말씀해주시면<br/>제휴 혜택과 최상의 서비스를 제공해드립니다.
                  </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDetail;
