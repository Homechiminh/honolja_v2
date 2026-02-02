import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext'; 
import { useFetchGuard } from '../hooks/useFetchGuard'; 

const CouponShop: React.FC = () => { 
  const [activeTab, setActiveTab] = useState<'shop' | 'my'>('shop');
  const [points, setPoints] = useState(0);
  const [myCoupons, setMyCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const { currentUser, loading: authLoading } = useAuth();

  const COUPON_LIST = [
    { id: 'c1', title: '5만동 즉시 할인권', price: 200, content: '제휴 업체 어디서나 즉시 사용 가능한 입문용 할인권', icon: '🎫' },
    // 🔴 요청 사항: "유흥 업체" -> "가라오케 등 방문 시"로 수정
    { id: 'c2', title: '소주 1병 무료 쿠폰', price: 300, content: '식사 또는 가라오케 등 방문 시 소주 1병 서비스', icon: '🍶' },
    { id: 'c3', title: '10만동 즉시 할인권', price: 400, content: '결제 금액에서 10만동을 즉시 차감해드리는 실속 쿠폰', icon: '💰' },
    { id: 'c4', title: '마사지/이발소 10% 할인', price: 600, content: '마사지 및 이발소 카테고리 이용 시 전체 금액 10% 할인', icon: '📉' },
    { id: 'c5', title: '모듬 과일안주 서비스', price: 900, content: '가라오케/바 방문 시 신선한 계절 과일안주 무료 제공', icon: '🍓' },
    { id: 'c6', title: '가라오케 10% 할인권', price: 1300, content: '가라오케 이용 시 전체 금액의 10% 파격 할인', icon: '🎤' },
    { id: 'c7', title: '모든업장 10% 할인권', price: 1700, content: '모든 제휴 업체 10% 할인 (단, 클럽 카테고리는 제외)', icon: '🔥' },
    { id: 'c8', title: '풀빌라 $20 할인권', price: 2200, content: '풀빌라 예약 시 현장 결제 금액에서 $20 즉시 할인', icon: '🏡' },
    { id: 'c9', title: '[스페셜] 운영진과 맥주 한 잔', price: 3000, content: '운영진과 직접 만나 꿀정보를 나누는 특별한 오프라인 시간', icon: '👑' },
  ];

  const fetchCouponData = async () => {
    if (!currentUser?.id) return;
    setDataLoading(true);
    try {
      const [profileRes, couponRes] = await Promise.all([
        supabase.from('profiles').select('points').eq('id', currentUser.id).single(),
        supabase.from('coupons').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false })
      ]);

      if (profileRes.error) throw profileRes.error;
      if (couponRes.error) throw couponRes.error;

      if (profileRes.data) setPoints(profileRes.data.points);
      if (couponRes.data) setMyCoupons(couponRes.data);
    } catch (err: any) {
      console.error("Data Sync Failed:", err.message);
    } finally {
      setDataLoading(false);
    }
  };

  useFetchGuard(fetchCouponData, [activeTab]);

  const handlePurchase = async (item: typeof COUPON_LIST[0]) => {
    if (!currentUser) return alert('로그인이 필요합니다.');
    if (points < item.price) return alert('포인트가 부족합니다.');
    if (!confirm(`[${item.title}] 쿠폰을 교환하시겠습니까?\n${item.price.toLocaleString()}P가 차감됩니다.`)) return;

    setLoading(true);
    try {
      const { error: pError } = await supabase
        .from('profiles')
        .update({ points: points - item.price })
        .eq('id', currentUser.id);
      if (pError) throw pError;

      const { error: cError } = await supabase.from('coupons').insert({
        user_id: currentUser.id,
        title: item.title,
        content: item.content,
        is_used: false,
        expired_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      if (cError) throw cError;

      await supabase.from('point_history').insert({
        user_id: currentUser.id,
        amount: -item.price,
        reason: `쿠폰 교환: ${item.title}`
      });

      alert('교환이 완료되었습니다! 내 쿠폰함에서 확인하세요.');
      await fetchCouponData();

    } catch (err: any) {
      alert('처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-red-600 font-black italic animate-pulse tracking-widest uppercase">
      쿠폰 샵 접속 중...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans text-white selection:bg-red-600/30">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
              호놀자 <span className="text-red-600">상점</span>
            </h2>
            <p className="text-gray-500 font-bold uppercase text-[11px] mt-4 italic tracking-[0.2em]">프리미엄 포인트 교환소</p>
          </div>
          
          <div className="bg-[#111] border-2 border-white/5 p-8 rounded-[2.5rem] flex flex-col items-end min-w-[280px] shadow-2xl">
            <span className="text-[10px] font-black text-gray-400 uppercase italic mb-2">보유 포인트</span>
            <span className="text-4xl font-black text-white italic tracking-tighter">
              {points.toLocaleString()} <span className="text-red-600 text-lg ml-1">P</span>
            </span>
          </div>
        </header>

        {/* 탭 네비게이션 */}
        <div className="flex gap-2 mb-12 bg-white/5 p-2 rounded-[2rem] w-fit font-bold italic">
          <button onClick={() => setActiveTab('shop')} className={`px-10 py-4 rounded-[1.5rem] uppercase transition-all ${activeTab === 'shop' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>쿠폰 구매</button>
          <button onClick={() => setActiveTab('my')} className={`px-10 py-4 rounded-[1.5rem] uppercase transition-all ${activeTab === 'my' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>내 쿠폰함</button>
        </div>

        {activeTab === 'shop' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COUPON_LIST.map((item) => (
              <div key={item.id} className="bg-[#0f0f0f] border border-white/5 rounded-[2.5rem] p-8 flex flex-col hover:border-red-600/50 transition-all duration-500 group shadow-lg">
                <div className="text-5xl mb-8 group-hover:scale-110 transition-transform duration-500">{item.icon}</div>
                <h3 className="text-xl font-black italic uppercase mb-2 tracking-tighter">{item.title}</h3>
                <p className="text-gray-500 text-[11px] mb-10 font-medium leading-relaxed h-10">{item.content}</p>
                
                {/* 🔴 요청 사항: 포인트 부족해도 가격 명시 (단, 비활성화 처리) */}
                <button 
                  onClick={() => handlePurchase(item)}
                  disabled={loading || points < item.price}
                  className={`w-full py-5 rounded-2xl font-black italic uppercase text-xs transition-all active:scale-95 ${
                    points < item.price 
                    ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
                    : 'bg-red-600 text-white hover:bg-white hover:text-red-600 shadow-xl'
                  }`}
                >
                  {item.price.toLocaleString()} P 교환
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {dataLoading ? (
              <div className="col-span-2 py-32 text-center text-gray-700 font-black italic animate-pulse uppercase tracking-widest">
                쿠폰 정보를 불러오는 중...
              </div>
            ) : myCoupons.length === 0 ? (
              <div className="col-span-2 py-32 text-center bg-[#0a0a0a] rounded-[3rem] border border-dashed border-white/10">
                <p className="text-gray-600 font-black italic uppercase tracking-widest">보유한 쿠폰이 없습니다</p>
              </div>
            ) : (
              myCoupons.map((coupon) => (
                <div key={coupon.id} className={`p-8 rounded-[2.5rem] border flex justify-between items-center transition-all ${coupon.is_used ? 'bg-black/40 border-white/5 opacity-30' : 'bg-[#111] border-red-600/20 shadow-2xl'}`}>
                  <div>
                    <h4 className="text-xl font-black italic uppercase text-white">{coupon.title}</h4>
                    <p className="text-gray-500 text-[10px] font-bold mt-2 uppercase italic">만료일: {new Date(coupon.expired_at).toLocaleDateString()}</p>
                  </div>
                  <div className={`px-6 py-2 rounded-xl font-black italic uppercase text-[10px] ${coupon.is_used ? 'bg-gray-800 text-gray-500' : 'bg-red-600 text-white shadow-lg'}`}>
                    {coupon.is_used ? '사용 완료' : '사용 가능'}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponShop;
