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
  const [activeImgIndex, setActiveImgIndex] = useState<number | null>(null);

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const fetchStoreDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('stores').select('*').eq('id', id).single();
      if (error) throw error;
      if (data) setStore(data as Store);
    } catch (err: any) {
      setStore(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialized) fetchStoreDetail();
  }, [id, initialized]);

  // 태그 리스트 변환 로직
  const tagList = useMemo<string[]>(() => {
    if (!store?.tags) return [];
    if (Array.isArray(store.tags)) return store.tags as string[];
    if (typeof store.tags === 'string') {
      return (store.tags as string).split(',').map((t: string) => t.trim()).filter(Boolean);
    }
    return [];
  }, [store?.tags]);

  // 구글 지도 URL 생성
  const mapUrl = useMemo(() => {
    if (!store?.address) return "";
    return `https://maps.google.com/maps?q=${encodeURIComponent(store.address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  }, [store?.address]);

  // 갤러리 이미지 추출
  const galleryImages = useMemo<string[]>(() => {
    if (!store) return [];
    return store.promo_images && store.promo_images.length > 0 
      ? store.promo_images 
      : [store.image_url].filter(Boolean) as string[];
  }, [store]);

  // 🔴 SEO용 카테고리 한글 변환 (맛집, 카페 포함)
  const getCategoryKR = (cat: string) => {
    const mapping: {[key: string]: string} = {
      massage: '마사지 스파',
      barber: '이발소',
      karaoke: '가라오케',
      barclub: '바 클럽',
      villa: '풀빌라 숙소',
      restaurant: '호치민 맛집',
      cafe: '호치민 카페',
      tour: '투어 서비스',
      vehicle: '차량 렌트'
    };
    return mapping[cat] || cat;
  };

  if (!initialized || loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-red-600 italic animate-pulse uppercase font-black tracking-widest">
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
    <div className="min-h-screen bg-[#050505] font-sans selection:bg-red-600/30 text-white overflow-x-hidden">
      {/* 🔴 SEO 최적화 Helmet 섹션 */}
      <Helmet>
        <title>호놀자 | {store.name} - 호치민 {getCategoryKR(store.category)} 추천 및 후기</title>
        <meta name="description" content={`${store.name} - 호치민 ${getCategoryKR(store.category)}의 위치, 가격, 예약 혜택 정보입니다. 호치민 맛집, 카페, 밤문화의 모든 정보를 호놀자에서 확인하세요.`} />
        <meta name="keywords" content={`${store.name}, 호치민맛집, 호치민카페, 호치민 유흥, 호치민 밤문화, 베트남여행, 베트남 여자, 호치민 가라오케, 호치민 마사지, 호치민 불건, 호치민 이발소, 호치민 바, 호치민 클럽`} />
        
        <meta property="og:title" content={`${store.name} | 호치민 ${getCategoryKR(store.category)} - 호놀자`} />
        <meta property="og:description" content={`검증된 호치민 프리미엄 업소 ${store.name}의 상세 정보와 특별 혜택을 확인하세요.`} />
        <meta property="og:image" content={store.image_url} />
        <meta property="og:url" content={`https://honolja.com/store/${store.id}`} />
        <meta property="og:type" content="article" />
      </Helmet>

      {/* Hero Header */}
      <div className="relative h-[40vh] md:h-[55vh] w-full bg-black">
        <div className="absolute inset-0 w-full h-full opacity-60 bg-cover bg-center" style={{ backgroundImage: `url('${store.image_url}')`, filter: 'blur(15px)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-[#050505]"></div>
        <div className="container mx-auto px-6 h-full flex items-end pb-8 relative z-10">
          <div className="flex flex-col md:flex-row items-end gap-8 w-full">
            <div className="w-36 h-48 md:w-52 md:h-72 rounded-[2rem] overflow-hidden border-4 border-white/10 shadow-2xl shrink-0">
              <img src={store.image_url} className="w-full h-full object-cover" alt={store.name} />
            </div>
            <div className="flex-grow pb-2 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                <span className="bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest italic shadow-lg">Premium {store.category}</span>
                {isAdmin && (
                  <button 
                    onClick={() => navigate(`/admin/edit-store/${store.id}`)} 
                    className="bg-emerald-600 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase italic shadow-lg hover:bg-emerald-500 transition-colors"
                  >
                    Edit Mode
                  </button>
                )}
              </div>
              <h1 className="text-3xl md:text-6xl font-black text-white mb-4 tracking-tighter italic leading-none uppercase break-keep">{store.name}</h1>
              
              {tagList.length > 0 && (
                <div className="flex flex-wrap justify-center md:justify-start gap-x-3 gap-y-1 mb-4">
                  {tagList.map((tag: string, i: number) => (
                    <span key={i} className="text-red-500 text-xs md:text-sm font-black italic">#{tag}</span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-center md:justify-start space-x-2 text-white font-black italic">
                <span className="text-yellow-500 text-2xl">★</span>
                <span className="text-2xl tracking-tighter">{store.rating?.toFixed(1) || "4.5"}</span>
              </div>
            </div>
          </div>
        </div>
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 z-30 p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all shadow-2xl">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-16">
            
            {/* Gallery */}
            <section>
              <h3 className="text-xl font-black text-white mb-8 italic uppercase tracking-tighter flex items-center">
                <div className="w-1 h-5 bg-red-600 mr-3 rounded-full"></div>
                Interior Gallery
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {galleryImages.map((img: string, i: number) => (
                  <div key={i} onClick={() => setActiveImgIndex(i)} className="aspect-[16/10] rounded-[2rem] overflow-hidden border-2 border-white/5 shadow-xl cursor-pointer group relative">
                    <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all flex items-center justify-center">
                       <span className="opacity-0 group-hover:opacity-100 text-white font-black text-[10px] uppercase italic bg-red-600 px-3 py-1 rounded-full shadow-lg transition-opacity">Zoom In</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Benefits */}
            <section className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-[2.5rem] p-8 md:p-10 border border-red-600/20 shadow-2xl">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                </div>
                <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase whitespace-nowrap">호놀자 제휴 혜택</h3>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(store.benefits && store.benefits.length > 0 ? store.benefits : ["호놀자 특별 할인가 제공", "예약 대기 시간 최소화"]).map((benefit: string, i: number) => (
                  <li key={i} className="flex items-center space-x-3 bg-white/[0.03] p-5 rounded-2xl border border-white/5 hover:bg-red-600/5 transition-colors">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                    <span className="text-slate-300 font-bold italic text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Description */}
            <section>
              <h3 className="text-xl font-black text-white mb-6 italic uppercase tracking-tighter flex items-center">
                <div className="w-1 h-5 bg-red-600 mr-3 rounded-full"></div>
                Information
              </h3>
              <div className="bg-[#0f0f0f] rounded-[2rem] p-8 border border-white/5">
                <p className="text-slate-400 text-base md:text-lg leading-[1.8] font-medium whitespace-pre-line break-keep italic">
                  {store.description || "상세 정보가 등록되지 않았습니다."}
                </p>
              </div>
            </section>

            {/* Location */}
            <section>
              <h3 className="text-xl font-black text-white mb-6 italic uppercase tracking-tighter flex items-center">
                <div className="w-1 h-5 bg-red-600 mr-3 rounded-full"></div>
                Location
              </h3>
              <div className="bg-[#0f0f0f] rounded-[2.5rem] p-8 border border-white/5 space-y-6">
                <div className="bg-black/50 px-6 py-4 rounded-xl border border-white/5">
                  <p className="text-white font-black italic text-base break-all leading-snug">📍 {store.address}</p>
                </div>
                <div className="h-[300px] md:h-[450px] bg-slate-900 rounded-[2rem] overflow-hidden border-2 border-white/5">
                  <iframe title="map" width="100%" height="100%" frameBorder="0" style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }} src={mapUrl} allowFullScreen></iframe>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
             <div className="sticky top-28 bg-white rounded-[2.5rem] p-10 text-black shadow-2xl">
                <span className="text-red-600 font-black text-[10px] uppercase tracking-[0.2em] block mb-2 italic text-center">Exclusive Reservation</span>
                <h4 className="text-2xl font-black mb-6 tracking-tighter italic uppercase leading-none text-center">실시간 예약 및 문의</h4>
                <div className="space-y-3">
                  <a href={store.kakao_url || SNS_LINKS.kakao} target="_blank" rel="noreferrer" className="w-full py-5 bg-[#FAE100] text-[#3C1E1E] rounded-2xl font-black text-center block hover:opacity-90 active:scale-95 transition-all flex items-center justify-center italic text-sm shadow-md">KAKAO TALK</a>
                  <a href={store.telegram_url || SNS_LINKS.telegram} target="_blank" rel="noreferrer" className="w-full py-5 bg-[#0088CC] text-white rounded-2xl font-black text-center block hover:opacity-90 active:scale-95 transition-all flex items-center justify-center italic text-sm shadow-md">TELEGRAM</a>
                </div>
                <p className="mt-8 text-[10px] text-slate-500 font-black uppercase text-center italic tracking-tighter break-keep leading-relaxed">
                  호놀자 보고 연락했다고 말씀해주시면 제휴 혜택과 최상의 서비스를 제공해드립니다.
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {activeImgIndex !== null && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in">
          <button onClick={() => setActiveImgIndex(null)} className="absolute top-10 right-10 w-12 h-12 bg-white/10 hover:bg-red-600 rounded-full flex items-center justify-center transition-all text-white text-2xl">✕</button>
          <img src={galleryImages[activeImgIndex]} alt="Zoom" className="max-w-5xl w-full max-h-[70vh] object-contain rounded-3xl border border-white/10 shadow-2xl" />
          <div className="mt-10 flex gap-4">
            <button onClick={() => setActiveImgIndex((prev) => (prev! > 0 ? prev! - 1 : galleryImages.length - 1))} className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl font-black italic uppercase text-xs hover:bg-white hover:text-black transition-all">Prev</button>
            <button onClick={() => setActiveImgIndex((prev) => (prev! < galleryImages.length - 1 ? prev! + 1 : 0))} className="px-8 py-3 bg-red-600 rounded-2xl font-black italic uppercase text-xs shadow-xl active:scale-95 transition-all">Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreDetail;
