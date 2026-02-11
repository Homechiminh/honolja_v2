// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext'; 
import { SNS_LINKS } from '../constants';
import { UserRole } from '../types'; 
import type { Store } from '../types';
// 공통 지도 컴포넌트 임포트
import MillMap from '../components/MillMap';

const StoreDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, initialized } = useAuth(); 

  const [store, setStore] = useState<Store | null>(null);
  const [allStores, setAllStores] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [activeImgIndex, setActiveImgIndex] = useState<number | null>(null);

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      // 1. 현재 업소 상세 정보
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('id', id)
        .single();
      
      if (storeError) throw storeError;
      
      if (storeData) {
        // 위경도 값이 숫자가 아닐 경우를 대비해 parseFloat로 엄격하게 변환
        const latVal = parseFloat(String(storeData.lat || storeData.Lat || 0));
        const lngVal = parseFloat(String(storeData.lng || storeData.Ing || storeData.Lng || 0));
        
        setStore({
          ...storeData,
          lat: latVal,
          lng: lngVal
        } as Store);
      }

      // 2. 전체 업소 데이터 (마커 표시용)
      const { data: allData, error: allError } = await supabase
        .from('stores')
        .select('*');

      if (!allError && allData) {
        const validData = allData.map((item: any) => ({
          ...item,
          lat: parseFloat(String(item.lat || item.Lat || 0)),
          lng: parseFloat(String(item.lng || item.Ing || item.Lng || 0))
        })).filter(item => item.lat !== 0 && item.lng !== 0);
        
        setAllStores(validData);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialized) fetchData();
  }, [id, initialized]);

  const tagList = useMemo<string[]>(() => {
    if (!store?.tags) return [];
    if (Array.isArray(store.tags)) return store.tags as string[];
    if (typeof store.tags === 'string') {
      return (store.tags as string).split(',').map((t: string) => t.trim()).filter(Boolean);
    }
    return [];
  }, [store?.tags]);

  const galleryImages = useMemo<string[]>(() => {
    if (!store) return [];
    return store.promo_images && store.promo_images.length > 0 
      ? store.promo_images 
      : [store.image_url].filter(Boolean) as string[];
  }, [store]);

  const displayImages = galleryImages.slice(0, 6);

  const getCategoryKR = (cat: string) => {
    const mapping: {[key: string]: string} = {
      massage: '마사지 스파', barber: '이발소', karaoke: '가라오케',
      barclub: '바 클럽', villa: '풀빌라 숙소', restaurant: '호치민 맛집',
      cafe: '호치민 카페', tour: '투어 서비스', vehicle: '차량 렌트'
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
      <Helmet>
        <title>호놀자 | {store.name} - 호치민 {getCategoryKR(store.category)} 추천 및 후기</title>
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
                  <button onClick={() => navigate(`/admin/edit-store/${store.id}`)} className="bg-emerald-600 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase italic shadow-lg hover:bg-emerald-500 transition-colors">Edit Mode</button>
                )}
              </div>
              <h1 className="text-3xl md:text-6xl font-black text-white mb-2 tracking-tighter italic leading-none uppercase break-keep">{store.name}</h1>
              
              {store.category === 'villa' && store.price && (
                <div className="mb-4 text-red-500 font-black text-xl md:text-2xl italic tracking-tighter uppercase">
                   {store.price} <span className="text-xs md:text-sm opacity-80">/ Per Night</span>
                </div>
              )}

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
            
            {/* 시설 사진 Section */}
            <section>
              <h3 className="text-xl font-black text-white mb-8 italic uppercase tracking-tighter flex items-center">
                <div className="w-1 h-5 bg-red-600 mr-3 rounded-full"></div>
                시설 사진
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {displayImages.map((img: string, i: number) => (
                  <div key={i} onClick={() => setActiveImgIndex(i)} className="aspect-[16/10] rounded-[1.5rem] overflow-hidden border-2 border-white/5 shadow-xl cursor-pointer group relative">
                    <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center">
                       <span className="text-white font-black text-[11px] uppercase italic bg-red-600 px-4 py-1.5 rounded-full shadow-2xl transform scale-90 group-hover:scale-100 transition-all">
                          {i === 5 && galleryImages.length > 6 ? '사진 더보기' : '사진 보기'}
                       </span>
                       {i === 5 && galleryImages.length > 6 && (
                         <span className="text-white/60 text-[9px] font-bold mt-2 uppercase tracking-widest">+{galleryImages.length - 6} more photos</span>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 호놀자 제휴 혜택 */}
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

            {/* 상세 정보 */}
            <section>
              <h3 className="text-xl font-black text-white mb-6 italic uppercase tracking-tighter flex items-center">
                <div className="w-1 h-5 bg-red-600 mr-3 rounded-full"></div>
                상세 정보
              </h3>
              <div className="bg-[#0f0f0f] rounded-[2rem] p-8 border border-white/5">
                <p className="text-slate-400 text-base md:text-lg leading-[1.8] font-medium whitespace-pre-line break-keep italic">
                  {store.description || "상세 정보가 등록되지 않았습니다."}
                </p>
              </div>
            </section>

            {/* 위치 안내 - MillMap 적용 완료 */}
            <section>
              <h3 className="text-xl font-black text-white mb-6 italic uppercase tracking-tighter flex items-center">
                <div className="w-1 h-5 bg-red-600 mr-3 rounded-full"></div>
                위치 안내
              </h3>
              <div className="bg-[#0f0f0f] rounded-[2.5rem] p-8 border border-white/5 space-y-6">
                <div className="bg-black/50 px-6 py-4 rounded-xl border border-white/5">
                  <p className="text-white font-black italic text-base break-all leading-snug">📍 {store.address}</p>
                </div>
                <div className="h-[400px] md:h-[500px] relative rounded-[2rem] overflow-hidden border-2 border-white/5">
                  {!loading && allStores.length > 0 && (
                    <MillMap 
                      key={store.id} 
                      stores={allStores} 
                      // ✅ 핵심 포인트: 현재 보고 있는 업소 ID를 전달하여 클로즈업 유도
                      focusStoreId={store.id} 
                    />
                  )}
                </div>
                <p className="text-center text-gray-500 text-[10px] font-bold italic uppercase tracking-widest">Ho Chi Minh Premium Guide Map © Honolja</p>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
             <div className="sticky top-28 bg-white rounded-[2.5rem] p-10 text-black shadow-2xl">
                <span className="text-red-600 font-black text-[10px] uppercase tracking-[0.2em] block mb-2 italic text-center">Exclusive Reservation</span>
                <h4 className="text-2xl font-black mb-4 tracking-tighter italic uppercase leading-none text-center">실시간 예약 및 문의</h4>
                
                {store.category === 'villa' && store.price && (
                  <div className="mb-6 py-3 border-y border-gray-100 text-center">
                    <p className="text-[10px] text-gray-400 font-black uppercase italic mb-1">Stay Price</p>
                    <p className="text-2xl font-black text-red-600 italic tracking-tighter">{store.price}</p>
                  </div>
                )}

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

      {/* Modal Slide UI */}
      {activeImgIndex !== null && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
          <button onClick={() => setActiveImgIndex(null)} className="absolute top-10 right-10 w-12 h-12 bg-white/10 hover:bg-red-600 rounded-full flex items-center justify-center transition-all text-white text-2xl z-50">✕</button>
          
          <div className="relative w-full max-w-5xl flex items-center justify-center group">
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveImgIndex((prev) => (prev! > 0 ? prev! - 1 : galleryImages.length - 1)); }}
              className="absolute left-0 md:-left-16 w-14 h-14 bg-white/5 hover:bg-red-600/80 rounded-full flex items-center justify-center transition-all border border-white/10 group-hover:scale-110 active:scale-90"
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
            </button>

            <img src={galleryImages[activeImgIndex]} alt="Zoom" className="w-full max-h-[75vh] object-contain rounded-3xl border border-white/10 shadow-2xl transition-all duration-500" />

            <button 
              onClick={(e) => { e.stopPropagation(); setActiveImgIndex((prev) => (prev! < galleryImages.length - 1 ? prev! + 1 : 0)); }}
              className="absolute right-0 md:-right-16 w-14 h-14 bg-white/5 hover:bg-red-600/80 rounded-full flex items-center justify-center transition-all border border-white/10 group-hover:scale-110 active:scale-90"
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          <div className="mt-8 px-8 py-2.5 bg-red-600 rounded-full border border-white/20 text-[10px] font-black italic uppercase tracking-[0.2em] shadow-lg">
            {activeImgIndex + 1} / {galleryImages.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreDetail;
