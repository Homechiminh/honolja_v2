import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStoreDetail } from '../hooks/useStoreDetail'; 
import { SNS_LINKS } from '../constants';
import type { User } from '../types';
import { UserRole } from '../types';

interface StoreDetailProps {
  currentUser: User | null;
}

const StoreDetail: React.FC<StoreDetailProps> = ({ currentUser }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // 1. 실시간 데이터 가져오기
  const { store, loading } = useStoreDetail(id);

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const handleDelete = () => {
    if (window.confirm('관리자 권한으로 이 업소를 삭제하시겠습니까?')) {
      alert('삭제 처리는 추후 관리자 전용 로직으로 구현 예정입니다.');
    }
  };

  // 2. 기존 스프라이트 로직 유지 (DB의 image_url/index 기반)
  const spriteConfig = useMemo(() => {
    if (!store) return { cols: 3, rows: 3, size: '300% 300%' };
    if (store.image_url.includes('kuf0m2')) {
      return { cols: 4, rows: 3, size: '400% 300%' };
    }
    return { cols: 3, rows: 3, size: '300% 300%' };
  }, [store]);

  const backgroundPosition = useMemo(() => {
    if (!store) return '0% 0%';
    const { cols, rows } = spriteConfig;
    const col = (store.image_index || 0) % cols;
    const row = Math.floor((store.image_index || 0) / cols);
    const x = cols > 1 ? (col / (cols - 1)) * 100 : 0;
    const y = rows > 1 ? (row / (rows - 1)) * 100 : 0;
    return `${x}% ${y}%`;
  }, [store, spriteConfig]);

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white italic animate-pulse">Loading Store Info...</div>;
  if (!store) return <div className="p-20 text-center text-white font-black italic">업소를 찾을 수 없습니다.</div>;

  // 3. 구글 지도 URL 생성
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(store.address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="min-h-screen bg-[#050505]">
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
        
        <div className="container mx-auto px-4 h-full flex items-end pb-12 relative z-10">
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
                <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Premium {store.category}</span>
                <span className="text-white/40 text-sm font-bold">{store.region} • 1군</span>
                {isAdmin && (
                  <button onClick={handleDelete} className="bg-black text-red-500 border border-red-500/30 px-3 py-1 rounded-full text-[10px] font-black hover:bg-red-600 hover:text-white ml-2 transition-all">
                    관리자: 업소 삭제
                  </button>
                )}
              </div>
              <h1 className="text-4xl md:text-7xl font-black text-white mb-4 tracking-tighter italic leading-none">{store.name}</h1>
              <div className="flex items-center justify-center md:justify-start space-x-6 text-white font-bold">
                 <div className="flex items-center space-x-2">
                   <span className="text-yellow-500 text-2xl">⭐</span>
                   <span className="text-2xl">{store.rating}</span>
                   <span className="text-white/40 font-medium">({store.review_count} reviews)</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
        
        <button onClick={() => navigate(-1)} className="absolute top-10 left-10 z-30 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-20">
            
            {/* 제휴 혜택 섹션 */}
            <section className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-[3rem] p-10 md:p-14 border border-red-600/20 shadow-[0_0_50px_-12px_rgba(220,38,38,0.2)]">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase">호놀자 제휴 혜택</h3>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(store.benefits || ["호놀자 회원 특별 할인가 제공", "예약 시 대기 시간 최소화", "프리미엄 관리사 우선 배정"]).map((benefit, i) => (
                  <li key={i} className="flex items-start space-x-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <svg className="w-5 h-5 text-red-500 mt-1 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span className="text-slate-200 font-bold leading-tight">{benefit}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Introduction 섹션 */}
            <section>
              <h3 className="text-2xl font-black text-white mb-6 italic uppercase tracking-tighter flex items-center">
                <div className="w-1.5 h-6 bg-red-600 mr-3 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
                Introduction
              </h3>
              <p className="text-slate-400 text-lg leading-relaxed font-medium whitespace-pre-line">
                {store.description}
              </p>
            </section>

            {/* Gallery 섹션 */}
            <section>
              <h3 className="text-2xl font-black text-white mb-8 italic uppercase tracking-tighter flex items-center">
                <div className="w-1.5 h-6 bg-red-600 mr-3 rounded-full"></div>
                Promotional Gallery
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {(store.promo_images || [store.image_url]).map((img, i) => (
                  <div key={i} className="aspect-[16/10] rounded-[2.5rem] overflow-hidden border border-white/10 group cursor-pointer relative shadow-2xl">
                    <img src={img} alt={`Promo ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                  </div>
                ))}
              </div>
            </section>

            {/* Location 섹션 */}
            <section>
              <h3 className="text-2xl font-black text-white mb-6 italic uppercase tracking-tighter flex items-center">
                <div className="w-1.5 h-6 bg-red-600 mr-3 rounded-full"></div>
                Location & Map
              </h3>
              <div className="bg-[#111] rounded-[3rem] p-8 md:p-12 border border-white/5 space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">ADDRESS</p>
                    <p className="text-white font-bold">{store.address}</p>
                  </div>
                </div>
                <div className="h-80 md:h-[450px] bg-slate-900 rounded-[2rem] overflow-hidden border border-white/5">
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
             <div className="sticky top-32 bg-white rounded-[3rem] p-10 text-black shadow-2xl">
                <span className="text-red-600 font-black text-[11px] uppercase tracking-widest block mb-2">Fast Reservation</span>
                <h4 className="text-2xl font-black mb-6 tracking-tighter">실시간 예약 및 문의</h4>
                
                {/* 4. 나중에 업소별 담당자 링크로 교체될 버튼들 */}
                <a href={store.kakao_url || SNS_LINKS.kakao} target="_blank" rel="noreferrer" className="w-full py-5 bg-[#FAE100] text-[#3C1E1E] rounded-2xl font-black text-center block mb-3 hover:scale-105 transition-all flex items-center justify-center space-x-2">
                  <span>카톡 예약하기</span>
                </a>
                <a href={store.telegram_url || SNS_LINKS.telegram} target="_blank" rel="noreferrer" className="w-full py-5 bg-[#0088CC] text-white rounded-2xl font-black text-center block hover:scale-105 transition-all flex items-center justify-center space-x-2">
                  <span>텔레그램 문의</span>
                </a>
                
                <p className="text-[10px] text-center text-slate-400 mt-6 font-bold uppercase tracking-tight">"호놀자 보고 연락했습니다"라고 말씀해주세요!</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDetail;
