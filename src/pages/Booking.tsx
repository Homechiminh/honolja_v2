import React, { useState, useEffect } from 'react'; // 🔴 useEffect 추가
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; // 🔴 Helmet 추가
import { supabase } from '../supabase';
import type { Store } from '../types';
import { useAuth } from '../contexts/AuthContext'; 

const Booking: React.FC = () => {
  const navigate = useNavigate();
  
  // 1. 전역 인증 정보에서 initialized를 가져옵니다. (로그인 여부와 상관없이 초기화 확인)
  const { initialized } = useAuth();

  const [services, setServices] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * 🔴 [방탄 fetch] 서비스 데이터 호출 로직
   */
  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .in('category', ['tour', 'vehicle', 'visa_guide'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      if (data) {
        setServices(data as Store[]);
      }
    } catch (err: any) {
      console.error("Travel Service Sync Failed:", err.message);
      setServices([]); 
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔴 [핵심 수정] 
   * useFetchGuard는 유저 세션을 체크하므로 비로그인 시 멈출 수 있습니다.
   * 공용 페이지이므로 일반 useEffect를 사용하여 초기화 완료 시 바로 호출합니다.
   */
  useEffect(() => {
    if (initialized) {
      fetchServices();
    }
  }, [initialized]);

  // 2. 전체 로딩 가드 (비로그인 유저도 initialized가 true가 되면 이 구간을 통과합니다)
  if (!initialized || (loading && services.length === 0)) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-white font-black italic animate-pulse tracking-widest uppercase">
          Loading Travel Services...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans selection:bg-red-600/30">
      {/* 🔴 SEO 최적화 메타 태그 */}
      <Helmet>
        <title>호놀자 | 베트남 투어 · 차량 렌트 · 가이드 예약 서비스</title>
        <meta name="description" content="호놀자가 검증한 베트남 현지 투어, 전용 차량 렌트, 전문 가이드 서비스를 만나보세요. 안전하고 편리한 호치민 여행의 동반자, 호놀자 예약 서비스입니다." />
        <meta name="keywords" content="베트남 투어, 호치민 투어, 베트남 차량 렌트, 호치민 가이드, 베트남 여행, 호놀자 예약, 호치민 공항 픽업" />
        
        {/* Open Graph (SNS 공유용) */}
        <meta property="og:title" content="호놀자 | 베트남 투어 & 차량 예약 서비스" />
        <meta property="og:description" content="베트남 현지 투어부터 전용 차량까지, 호놀자에서 한 번에 예약하세요." />
        <meta property="og:url" content="https://honolja.com/booking" />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <header className="mb-16">
          <span className="text-red-600 font-black text-xs uppercase tracking-[0.3em] block mb-4 italic">Premium Selection</span>
          <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">
            Travel <span className="text-red-600">Services</span>
          </h1>
          <p className="text-gray-500 text-lg font-bold">호놀자가 검증한 최고급 투어, 차량 및 가이드 서비스</p>
        </header>

        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in fade-in duration-700">
            {services.map((item) => (
              <div 
                key={item.id} 
                onClick={() => navigate(`/store/${item.id}`)}
                className="bg-[#0f0f0f] rounded-[3rem] overflow-hidden border border-white/5 group cursor-pointer hover:border-red-600/50 transition-all shadow-2xl"
              >
                {/* 카드 상단 이미지 */}
                <div className="h-72 overflow-hidden relative">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" />
                  <div className="absolute top-8 left-8">
                    <span className="bg-red-600 text-white text-[10px] font-black px-5 py-2 rounded-full uppercase italic shadow-xl tracking-widest">
                      {item.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* 카드 상세 정보 */}
                <div className="p-10">
                  <h3 className="text-2xl font-black text-white mb-4 italic uppercase tracking-tight group-hover:text-red-500 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-gray-400 font-medium line-clamp-2 mb-8 leading-relaxed italic">
                    {item.description}
                  </p>
                  
                  <div className="flex justify-between items-center border-t border-white/5 pt-8">
                    <div className="flex flex-col">
                      <span className="text-red-600 font-black text-[10px] uppercase italic tracking-tighter">Verified Service</span>
                      <span className="text-white font-black italic uppercase text-xs">Premium Selection</span>
                    </div>
                    <button className="px-8 py-3.5 bg-red-600 text-white text-[11px] font-black rounded-xl uppercase italic shadow-lg shadow-red-900/40 group-hover:scale-105 transition-all">
                      예약문의
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-40 text-center border-2 border-dashed border-white/5 rounded-[3.5rem] bg-[#0f0f0f]/30 animate-in fade-in duration-500">
            <p className="text-gray-600 font-black text-2xl italic uppercase tracking-widest">준비된 서비스가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
