import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import type { Store } from '../types';

const Booking: React.FC = () => {
  const [services, setServices] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true); // 로딩 상태 활용으로 에러 해결
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      // 투어, 차량, 비자/가이드 카테고리 데이터만 추출
      const { data } = await supabase
        .from('stores')
        .select('*')
        .in('category', ['tour', 'vehicle', 'visa_guide'])
        .order('created_at', { ascending: false });
      
      if (data) setServices(data);
      setLoading(false);
    };
    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-white font-black italic animate-pulse tracking-widest uppercase">
          Loading Travel Services...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16">
          <span className="text-red-600 font-black text-xs uppercase tracking-[0.3em] block mb-4 italic">Premium Selection</span>
          <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter mb-4">
            Travel <span className="text-red-600">Services</span>
          </h1>
          <p className="text-gray-500 text-lg font-bold">호놀자가 검증한 최고급 투어, 차량 및 가이드 서비스</p>
        </header>

        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {services.map((item) => (
              <div 
                key={item.id} 
                onClick={() => navigate(`/store/${item.id}`)}
                className="bg-[#0f0f0f] rounded-[3rem] overflow-hidden border border-white/5 group cursor-pointer hover:border-red-600/50 transition-all shadow-2xl"
              >
                {/* 카드 상단 이미지 */}
                <div className="h-72 overflow-hidden relative">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
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
                  <p className="text-gray-400 font-medium line-clamp-2 mb-8 leading-relaxed">
                    {item.description}
                  </p>
                  
                  <div className="flex justify-between items-center border-t border-white/5 pt-8">
                    <div className="flex flex-col">
                      <span className="text-red-600 font-black text-[10px] uppercase italic tracking-tighter">Verified Service</span>
                      <span className="text-white font-black italic">PREMIUM STAYS</span>
                    </div>
                    <button className="px-8 py-3.5 bg-red-600 text-white text-[11px] font-black rounded-xl uppercase italic shadow-lg shadow-red-900/20 group-hover:scale-105 transition-all">
                      예약문의
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-40 text-center border-2 border-dashed border-white/5 rounded-[3.5rem]">
            <p className="text-gray-600 font-black text-2xl italic uppercase tracking-widest">준비된 서비스가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
