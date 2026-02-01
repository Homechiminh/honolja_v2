import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStoreDetail } from '../hooks/useStoreDetail'; 
import { useAuth } from '../contexts/AuthContext'; // 
import { SNS_LINKS } from '../constants';
import { UserRole } from '../types';

// 🔴 StoreDetailProps 인터페이스 제거 (더 이상 프롭을 받지 않음)

const StoreDetail: React.FC = () => { // 🔴 프롭 정의 제거
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // 1. 전역 인증 정보 가져오기
  const { currentUser, loading: authLoading } = useAuth(); // 🔴 Context에서 구독

  // 2. 실시간 업소 데이터 가져오기
  const { store, loading: storeLoading } = useStoreDetail(id);

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const handleDelete = () => {
    if (window.confirm('관리자 권한으로 이 업소를 삭제하시겠습니까?')) {
      alert('삭제 처리는 관리자 대시보드(Manage Stores)를 이용해 주세요.');
    }
  };

  // 이미지 스프라이트 설정
  const spriteConfig = useMemo(() => {
    if (!store) return { cols: 1, rows: 1, size: 'cover' };
    if (store.image_url?.includes('supabase.co')) {
      return { cols: 1, rows: 1, size: 'cover' };
    }
    if (store.image_url?.includes('kuf0m2')) {
      return { cols: 4, rows: 3, size: '400% 300%' };
    }
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

  // 구글 지도 URL 생성
  const mapUrl = useMemo(() => {
    if (!store?.address) return "";
    return `https://maps.google.com/maps?q=${encodeURIComponent(store.address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  }, [store?.address]);

  // 🔴 인증 로딩이나 데이터 로딩 중일 때 로딩 바 표시
  if (authLoading || storeLoading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white italic animate-pulse tracking-widest uppercase font-black">
      Syncing Store Intelligence...
    </div>
  );

  if (!store) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-center">
        <p className="text-white font-black italic uppercase text-2xl mb-6 tracking-tighter">Target Not Found</p>
        <button onClick={() => navigate(-1)} className="text-red-600 font-bold uppercase text-xs border-b border-red-600 pb-1">Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] font-sans selection:bg-red-600/30">
      {/* Hero Header 섹션 */}
      <div className="relative h-[50vh] md:h-[70vh] w-full overflow-hidden bg-black">
        <div 
          className="absolute inset-0 w-full h-full opacity-60"
          style={{
            backgroundImage: `url('${store.image_url}')`,
            backgroundSize: spriteConfig.size,
            backgroundPosition: backgroundPosition,
            filter: 'blur(20px)',
            transform: 'scale(1.2)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-[#050505]"></div>
        
        <div className="container mx-auto px-6 h-full flex items-end pb-12 relative z-10">
          <div className="flex flex-col md:flex-row items-end gap-10">
            <div className="w-48 h-64 md:w-64 md:h-80 rounded-[2.5rem] overflow-hidden border-4 border-white/10 shadow-2xl shrink-0">
               <div 
                 className="w-full h-full"
                 style={{
                   backgroundImage: `url('${store.image_url}')`,
                   backgroundSize: spriteConfig.size,
                   backgroundPosition: backgroundPosition,
                 }}
               />
            </div>
            <div className="flex-grow pb-4 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest italic">Premium {store.category}</span>
                <span className="text-white/40 text-sm font-bold uppercase tracking-tighter italic">{store.region} • VIETNAM</span>
                {isAdmin && (
                  <button onClick={handleDelete} className="bg-black/80 text-red-500 border border-red-500/30 px-4 py-1 rounded-full text-[9px] font-black hover:bg-red-600 hover:text-white ml-2 transition-all uppercase italic">
                    Admin: Control Mode
                  </button>
                )}
              </div>
              <h1 className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter italic leading-none uppercase">{store.name}</h1>
              <div className="flex items-center justify-center md:justify-start space-x-6 text-white font-black italic">
                 <div className="flex items-center space-x-2">
                   <span className="text-yellow-500 text-3xl">★</span>
                   <span className="text-3xl tracking-tighter">{store.rating}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
        
        <button onClick={() => navigate(-1)} className="absolute top-10 left-10 z-30 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all shadow-2xl">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-20">
            {/* 제휴 혜택 섹션 */}
            <section className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-[3.5rem] p-10 md:p-14 border border-red-600/20 shadow-2xl">
              <div className="flex items-center space-x-4 mb-10">
                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                </div>
                <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">호놀자 전용 멤버십 혜택</h3>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(store.benefits || ["호놀자 회원 특별 할인가 제공", "예약 시 대기 시간 최소화"]).map((benefit, i) => (
                  <li key={i} className="flex items-center space-x-4 bg-white/[0.03] p-6 rounded-3xl border border-white/5 group hover:bg-red-600/5 transition-colors">
                    <div className="w-2 h-2 bg-red-600 rounded-full group-hover:animate-ping"></div>
                    <span className="text-slate-200 font-bold italic tracking-tight">{benefit}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Information 섹션 */}
            <section>
              <h3 className="text-2xl font-black text-white mb-8 italic uppercase tracking-tighter flex items-center">
                <div className="w-1.5 h-6 bg-red-600 mr-4 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
                Store Information
              </h3>
              <div className="bg-[#0f0f0f] rounded-[2.5rem] p-10 border border-white/5">
                <p className="text-slate-400 text-lg md:text-xl leading-relaxed font-medium whitespace-pre-line italic">
                  {store.description}
                </p>
              </div>
            </section>

            {/* Gallery 섹션 */}
            <section>
              <h3 className="text-2xl font-black text-white mb-10 italic uppercase tracking-tighter flex items-center">
                <div className="w-1.5 h-6 bg-red-600 mr-4 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
                Interior Gallery
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {(store.promo_images && store.promo_images.length > 0 ? store.promo_images : [store.image_url]).map((img, i) => (
                  <div key={i} className="aspect-[16/10] rounded-[3rem] overflow-hidden border-2 border-white/5 group cursor-pointer relative shadow-2xl">
                    <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                  </div>
                ))}
              </div>
            </section>

            {/* Location 섹션 */}
            <section>
              <h3 className="text-2xl font-black text-white mb-8 italic uppercase tracking-tighter flex items-center">
                <div className="w-1.5 h-6 bg-red-600 mr-4 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
                Our Location
              </h3>
              <div className="bg-[#0f0f0f] rounded-[3.5rem] p-8 md:p-12 border border-white/5 space-y-8 shadow-2xl">
                <div>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-3 ml-2 italic">Official Address</p>
                  <div className="bg-black/50 px-8 py-5 rounded-2xl border border-white/5">
                    <p className="text-white font-black italic text-lg tracking-tight">{store.address}</p>
                  </div>
                </div>
                <div className="h-[450px] md:h-[550px] bg-slate-900 rounded-[2.5rem] overflow-hidden border-2 border-white/5 shadow-inner">
                   <iframe
                     title="store-location"
                     width="100%" height="100%" frameBorder="0"
                     style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
                     src={mapUrl}
                     allowFullScreen
                   ></iframe>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar - 고정 예약창 */}
          <div className="space-y-6">
             <div className="sticky top-32 bg-white rounded-[3.5rem] p-12 text-black shadow-[0_30px_60px_-15px_rgba(255,255,255,0.1)]">
                <span className="text-red-600 font-black text-[11px] uppercase tracking-[0.2em] block mb-3 italic">Exclusive Reservation</span>
                <h4 className="text-3xl font-black mb-8 tracking-tighter italic uppercase leading-none">실시간 예약 및<br/>VIP 컨설팅</h4>
                
                <div className="space-y-4">
                  <a href={store.kakao_url || SNS_LINKS.kakao} target="_blank" rel="noreferrer" className="w-full py-6 bg-[#FAE100] text-[#3C1E1E] rounded-[1.5rem] font-black text-center block hover:bg-[#F2D800] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 shadow-xl group">
                    <span className="uppercase tracking-tighter italic text-sm group-hover:scale-105 transition-transform">KakaoTalk Reservation</span>
                  </a>
                  <a href={store.telegram_url || SNS_LINKS.telegram} target="_blank" rel="noreferrer" className="w-full py-6 bg-[#0088CC] text-white rounded-[1.5rem] font-black text-center block hover:bg-[#007AB8] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 shadow-xl group">
                    <span className="uppercase tracking-tighter italic text-sm group-hover:scale-105 transition-transform">Telegram Inquiry</span>
                  </a>
                </div>
                
                <div className="mt-10 pt-10 border-t border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400 font-black uppercase leading-loose italic tracking-tighter">
                    "호놀자 프로모션 적용 요청"<br/>
                    라고 말씀해주시면 최상의 멤버십<br/>서비스를 약속드립니다.
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
