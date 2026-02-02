import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import type { Store } from '../types';
import { useAuth } from '../contexts/AuthContext'; 
import { useFetchGuard } from '../hooks/useFetchGuard'; 

const Booking: React.FC = () => {
  const navigate = useNavigate();
  
  // 1. 전역 인증 정보 구독
  const { loading: authLoading } = useAuth();

  const [services, setServices] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * 🔴 [방탄 fetch] 서비스 데이터 호출 로직
   * 406 에러나 세션 지연이 발생해도 finally 블록이 로딩 스피너를 확실히 해제합니다.
   */
  const fetchServices = async () => {
    setLoading(true); // 로딩 시작
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .in('category', ['tour', 'vehicle', 'visa_guide'])
        .order('created_at', { ascending: false });
      
      if (error) {
        // 🔴 서버 거절(406) 등의 에러 발생 시 catch로 즉시 이동
        throw error;
      }

      if (data) {
        setServices(data as Store[]);
      }
    } catch (err: any) {
      console.error("Travel Service Sync Failed (406 등):", err.message);
      // 에러 발생 시 기존 리스트를 비워 잘못된 정보 노출 방지
      setServices([]); 
    } finally {
      // 🔴 핵심: 성공하든 실패하든 무조건 로딩 상태 해제
      setLoading(false);
    }
  };

  /**
   * 🔴 [데이터 가드 적용] 
   * 인증 확인이 완료된 최적의 타이밍에 데이터를 안전하게 동기화합니다.
   */
  useFetchGuard(fetchServices, []);

  // 2. 전체 로딩 가드 (인증 확인 중일 때의 블랙아웃 방지)
  if (authLoading || (loading && services.length === 0)) {
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
