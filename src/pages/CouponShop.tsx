import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext'; // 🔴 임포트 추가
import { useFetchGuard } from '../hooks/useFetchGuard'; // 🔴 임포트 추가

const CouponShop: React.FC = () => { // 🔴 프롭 제거
  const [activeTab, setActiveTab] = useState<'shop' | 'my'>('shop');
  const [points, setPoints] = useState(0);
  const [myCoupons, setMyCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 전역 인증 정보 가져오기
  const { currentUser, loading: authLoading } = useAuth();

  const COUPON_LIST = [
    { id: 'c1', title: '5만동 즉시 할인권', price: 200, content: '제휴 업체 어디서나 즉시 사용 가능한 입문용 할인권', icon: '🎫' },
    { id: 'c2', title: '소주 1병 무료 쿠폰', price: 300, content: '식사 또는 유흥 업체 방문 시 소주 1병 서비스', icon: '🍶' },
    { id: 'c3', title: '10만동 즉시 할인권', price: 400, content: '결제 금액에서 10만동을 즉시 차감해드리는 실속 쿠폰', icon: '💰' },
    { id: 'c4', title: '마사지/이발소 10% 할인', price: 600, content: '마사지 및 이발소 카테고리 이용 시 전체 금액 10% 할인', icon: '📉' },
    { id: 'c5', title: '모듬 과일안주 서비스', price: 900, content: '가라오케/바 방문 시 신선한 계절 과일안주 무료 제공', icon: '🍓' },
    { id: 'c6', title: '가라오케 10% 할인권', price: 1300, content: '가라오케 이용 시 전체 금액의 10% 파격 할인', icon: '🎤' },
    { id: 'c7', title: '모든업장 10% 할인권', price: 1700, content: '모든 제휴 업체 10% 할인 (단, 클럽 카테고리는 제외)', icon: '🔥' },
    { id: 'c8', title: '풀빌라 $20 할인권', price: 2200, content: '풀빌라 예약 시 현장 결제 금액에서 $20 즉시 할인', icon: '🏡' },
    { id: 'c9', title: '운영진과 맥주 한 잔', price: 3000, content: '[SPECIAL] 운영진과 만나 꿀정보를 나누는 특별한 시간', icon: '👑' },
  ];

  // 🔴 [데이터 가드] 인증이 완료되고 탭이 바뀔 때마다 실행
  useFetchGuard(async () => {
    if (!currentUser?.id) return;
    
    // 1. 포인트 정보 동기화
    const { data: profile } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', currentUser.id)
      .single();
    if (profile) setPoints(profile.points);

    // 2. 내 쿠폰 목록 동기화
    const { data: coupons } = await supabase
      .from('coupons')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });
    if (coupons) setMyCoupons(coupons);
  }, [activeTab]); // activeTab이 바뀔 때마다 데이터를 최신화함

  const handlePurchase = async (item: typeof COUPON_LIST[0]) => {
    if (!currentUser) return alert('로그인이 필요합니다.');
    if (points < item.price) return alert('포인트가 부족합니다.');
    if (!confirm(`[${item.title}]을(를) 교환하시겠습니까?\n${item.price}P가 차감됩니다.`)) return;

    setLoading(true);
    try {
      // 1. 포인트 차감
      const { error: pError } = await supabase
        .from('profiles')
        .update({ points: points - item.price })
        .eq('id', currentUser.id);
      if (pError) throw pError;

      // 2. 쿠폰 발급
      const { error: cError } = await supabase.from('coupons').insert({
        user_id: currentUser.id,
        title: item.title,
        content: item.content,
        is_used: false,
        expired_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      if (cError) throw cError;

      // 3. 포인트 내역 기록
      await supabase.from('point_history').insert({
        user_id: currentUser.id,
        amount: -item.price,
        reason: `쿠폰 교환: ${item.title}`
      });

      alert('교환 성공! My Wallet에서 확인하세요.');
      
      // 즉시 UI 갱신을 위해 데이터 수동 호출 (혹은 refreshUser 사용 가능)
      const { data: updatedProfile } = await supabase.from('profiles').select('points').eq('id', currentUser.id).single();
      if (updatedProfile) setPoints(updatedProfile.points);
      const { data: updatedCoupons } = await supabase.from('coupons').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false });
      if (updatedCoupons) setMyCoupons(updatedCoupons);

    } catch (err) {
      alert('처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 인증 정보를 확인하는 동안 보여줄 로딩 화면
  if (authLoading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-red-600 font-black italic animate-pulse tracking-widest uppercase">
      Connecting to Marketplace...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans text-white selection:bg-red-600/30">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
              Honolja <span className="text-red-600">Shop</span>
            </h2>
            <p className="text-gray-500 font-bold uppercase text-[11px] mt-4 italic tracking-[0.2em]">Premium Point Exchange</p>
          </div>
          
          <div className="bg-[#111] border-2 border-white/5 p-8 rounded-[2.5rem] flex flex-col items-end min-w-[280px] shadow-2xl">
            <span className="text-[10px] font-black text-gray-400 uppercase italic mb-2">Available Points</span>
            <span className="text-4xl font-black text-white italic tracking-tighter">
              {points.toLocaleString()} <span className="text-red-600 text-lg ml-1">P</span>
            </span>
          </div>
        </header>

        {/* 탭 네비게이션 */}
        <div className="flex gap-2 mb-12 bg-white/5 p-2 rounded-[2rem] w-fit">
          <button onClick={() => setActiveTab('shop')} className={`px-10 py-4 rounded-[1.5rem] font-black italic uppercase transition-all ${activeTab === 'shop' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Store</button>
          <button onClick={() => setActiveTab('my')} className={`px-10 py-4 rounded-[1.5rem] font-black italic uppercase transition-all ${activeTab === 'my' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>My Wallet</button>
        </div>

        {activeTab === 'shop' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COUPON_LIST.map((item) => (
              <div key={item.id} className="bg-[#0f0f0f] border border-white/5 rounded-[2.5rem] p-8 flex flex-col hover:border-red-600/50 transition-all duration-500 group">
                <div className="text-5xl mb-8 group-hover:scale-110 transition-transform duration-500">{item.icon}</div>
                <h3 className="text-xl font-black italic uppercase mb-2 tracking-tighter">{item.title}</h3>
                <p className="text-gray-500 text-[11px] mb-10 font-medium leading-relaxed h-10">{item.content}</p>
                <button 
                  onClick={() => handlePurchase(item)}
                  disabled={loading || points < item.price}
                  className="w-full py-5 bg-white/5 group-hover:bg-red-600 text-white rounded-2xl font-black italic uppercase text-xs transition-all disabled:opacity-5 active:scale-95"
                >
                  {points < item.price ? 'INSUFFICIENT POINTS' : `${item.price.toLocaleString()} P EXCHANGE`}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {myCoupons.length === 0 ? (
              <div className="col-span-2 py-32 text-center bg-[#0a0a0a] rounded-[3rem] border border-dashed border-white/10">
                <p className="text-gray-600 font-black italic uppercase tracking-widest">No Coupons Found</p>
              </div>
            ) : (
              myCoupons.map((coupon) => (
                <div key={coupon.id} className={`p-8 rounded-[2.5rem] border flex justify-between items-center transition-all ${coupon.is_used ? 'bg-black/40 border-white/5 opacity-30' : 'bg-[#111] border-red-600/20 shadow-2xl'}`}>
                  <div>
                    <h4 className="text-xl font-black italic uppercase text-white">{coupon.title}</h4>
                    <p className="text-gray-500 text-[10px] font-bold mt-2 uppercase italic">Exp: {new Date(coupon.expired_at).toLocaleDateString()}</p>
                  </div>
                  <div className={`px-6 py-2 rounded-xl font-black italic uppercase text-[10px] ${coupon.is_used ? 'bg-gray-800 text-gray-500' : 'bg-red-600 text-white shadow-lg'}`}>
                    {coupon.is_used ? 'Used' : 'Ready'}
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
