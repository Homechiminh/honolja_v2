import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useStores } from '../hooks/useStores';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import StoreCard from '../components/StoreCard';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, initialized, refreshUser } = useAuth();
  const { stores, loading: storesLoading } = useStores('all');
  
  const [latestPosts, setLatestPosts] = useState<any[]>([]);
  const [latestVipPosts, setLatestVipPosts] = useState<any[]>([]);
  const [latestNotices, setLatestNotices] = useState<any[]>([]);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false); // 출석 팝업 상태
  const [currentAdIdx, setCurrentAdIdx] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all'); 

  // 🔴 [자동 출석 체크 & 팝업 시스템]
  useEffect(() => {
    const checkAttendance = async () => {
      if (!initialized || !currentUser) return;
      
      // 로컬 스토리지로 오늘 이미 팝업을 봤는지 체크 (중복 팝업 방지)
      const today = new Date().toLocaleDateString('en-CA');
      const hasSeenToday = localStorage.getItem(`attendance_${currentUser.id}_${today}`);
      
      try {
        const { data: existing } = await supabase
          .from('attendance')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('check_in_date', today)
          .maybeSingle();

        if (!existing) {
          // DB에 출석 기록 저장
          const { error: insertError } = await supabase
            .from('attendance')
            .insert([{ user_id: currentUser.id, check_in_date: today }]);

          if (!insertError) {
            const rewardPoints = 5;
            // 포인트 업데이트
            await supabase.from('profiles')
              .update({ points: (currentUser.points || 0) + rewardPoints })
              .eq('id', currentUser.id);
            
            await refreshUser();
            setShowAttendanceModal(true); // 성공 팝업 띄우기
            localStorage.setItem(`attendance_${currentUser.id}_${today}`, 'true');
          }
        }
      } catch (err) { 
        console.error("Attendance Error:", err); 
      }
    };

    checkAttendance();
  }, [initialized, currentUser, refreshUser]);

  // 📍 [데이터 필터링]
  const filteredStores = useMemo(() => {
    return stores.filter((s: any) => activeCategory === 'all' || s.category === activeCategory);
  }, [stores, activeCategory]);

  const hotServiceStores = useMemo(() => {
    return filteredStores.filter((s: any) => s.is_hot && s.category !== 'villa').sort(() => Math.random() - 0.5).slice(0, 14);
  }, [filteredStores]);

  const premiumHotStays = useMemo(() => {
    return stores.filter((s: any) => s.category === 'villa' && s.is_hot).slice(0, 2);
  }, [stores]);

  // 상단 배너 타이머
  useEffect(() => {
    const timer = setInterval(() => setCurrentAdIdx((prev) => (prev === 0 ? 1 : 0)), 5000);
    return () => clearInterval(timer);
  }, []);

  const fetchHomeData = async () => {
    try {
      const [postRes, vipRes, noticeRes] = await Promise.all([
        supabase.from('posts').select('*, author:profiles(nickname)').neq('category', 'vip').order('created_at', { ascending: false }).limit(6),
        supabase.from('posts').select('*, author:profiles(nickname)').eq('category', 'vip').order('created_at', { ascending: false }).limit(6),
        supabase.from('notices').select('*').order('is_important', { ascending: false }).order('created_at', { ascending: false }).limit(6)
      ]);
      if (postRes.data) setLatestPosts(postRes.data);
      if (vipRes.data) setLatestVipPosts(vipRes.data);
      if (noticeRes.data) setLatestNotices(noticeRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { if (initialized) fetchHomeData(); }, [initialized]);

  const handleVipPostClick = (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    if (!currentUser || currentUser.level < 3) setShowLevelModal(true);
    else navigate(`/post/${postId}`);
  };

  const categories = [
    { id: 'massage', name: '마사지/스파', icon: '💆‍♀️' },
    { id: 'barber', name: '이발소', icon: '💈' },
    { id: 'karaoke', name: '가라오케', icon: '🎤' },
    { id: 'barclub', name: '바/클럽', icon: '🍸' },
    { id: 'villa', name: '숙소/풀빌라', icon: '🏠' }
  ];

  if (!initialized) return null;

  return (
    <div className="w-full bg-[#050505] relative overflow-hidden selection:bg-red-600/30 font-sans text-white">
      <Helmet>
        <title>호놀자 | 베트남 호치민 프리미엄 가이드</title>
      </Helmet>

      {/* Hero 섹션 */}
      <section className="relative pt-44 pb-24 px-6 flex flex-col items-center text-center">
        <h2 className="text-7xl md:text-9xl font-black italic tracking-tighter mb-8 leading-none">
          <span className="text-[#FF0000] brightness-125 saturate-200 drop-shadow-[0_0_20px_rgba(255,0,0,0.4)]">호</span>치민에서 <span className="text-[#FF0000] brightness-125 saturate-200 drop-shadow-[0_0_20px_rgba(255,0,0,0.4)] tracking-tighter">놀자<span className="ml-5 md:ml-3">!</span></span>
        </h2>
        
        <div className="space-y-4 mb-16 z-10 px-4 flex flex-col items-center">
          <p className="text-[17px] sm:text-2xl md:text-4xl font-black tracking-tight uppercase whitespace-nowrap leading-tight">남성들을 위한 호치민의 모든 것</p>
          <p className="text-blue-500 font-black text-lg md:text-2xl italic leading-snug">실시간 정보 + 검증된 업장 + 그 이상의 즐거움(α)</p>
          <p className="text-emerald-400 font-bold text-sm md:text-lg opacity-90 mt-2 italic">풀빌라 · 아파트 예약까지 한번에!</p>
        </div>

        <div className="grid grid-cols-5 gap-2 md:gap-4 max-w-5xl w-full z-10 px-2 font-sans">
          {categories.map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => navigate(`/stores/${cat.id}`)}
              className="flex flex-col items-center gap-2 md:gap-4 p-3 md:p-10 rounded-2xl md:rounded-[32px] border border-white/5 bg-white/5 hover:bg-white/10 hover:border-red-600/50 transition-all group shadow-lg"
            >
              <span className="text-2xl md:text-5xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-[8px] md:text-sm font-black uppercase tracking-tighter whitespace-nowrap text-gray-400 group-hover:text-white">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 🔥 실시간 인기 업소 */}
      <section className="max-w-[1400px] mx-auto px-6 py-10 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <h3 className="text-xl md:text-3xl font-black italic flex items-center gap-3">
            <span className="w-1.5 h-6 md:h-8 bg-red-600 rounded-full"></span> 
            {activeCategory === 'all' ? 'HOT 실시간 인기 업소' : `${activeCategory.toUpperCase()} 추천 리스트`}
          </h3>
          
          <div className="flex flex-wrap gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5 font-sans">
            <button onClick={() => setActiveCategory('all')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeCategory === 'all' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:text-white'}`}>전체</button>
            {categories.map(c => (
              <button key={c.id} onClick={() => setActiveCategory(c.id)} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeCategory === c.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:text-white'}`}>{c.name.split('/')[0]}</button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 font-sans">
          {storesLoading ? (
            [...Array(10)].map((_, i) => <div key={i} className="aspect-[3/4] bg-white/5 rounded-[24px] animate-pulse" />)
          ) : (
            hotServiceStores.map((store: any) => <StoreCard key={store.id} store={store} />)
          )}
        </div>
      </section>

      {/* 커뮤니티 섹션 */}
      <section className="max-w-[1400px] mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 text-white font-sans">
        <div className="lg:col-span-2 flex flex-row lg:flex-col gap-4">
          <a href="https://t.me/honolja" target="_blank" rel="noreferrer" className="flex-1 bg-[#0088cc] rounded-[1.5rem] p-6 relative overflow-hidden group hover:scale-[1.03] transition-all shadow-xl flex flex-col justify-center min-h-[140px]">
            <span className="text-[10px] font-black text-white/60 uppercase block mb-1 z-10 italic">Channel</span>
            <h4 className="text-sm md:text-xl font-black italic z-10 leading-tight">호놀자 텔레그램</h4>
          </a>
          <a href="https://open.kakao.com/o/gx4EsPRg" target="_blank" rel="noreferrer" className="flex-1 bg-[#FEE500] rounded-[1.5rem] p-6 relative overflow-hidden group hover:scale-[1.03] transition-all text-black shadow-xl flex flex-col justify-center min-h-[140px]">
            <span className="text-[10px] font-black text-black/40 uppercase block mb-1 z-10 italic">Open Chat</span>
            <h4 className="text-sm md:text-xl font-black italic z-10 leading-tight">호놀자 카카오톡</h4>
          </a>
        </div>
        <div className="lg:col-span-10 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-black italic text-lg border-l-4 border-red-600 pl-3 uppercase">Community</h4>
              <Link to="/community" className="text-[10px] text-gray-300 font-bold underline italic">더보기</Link>
            </div>
            <div className="bg-[#111] rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden">
              {latestPosts.map(post => (
                <Link key={post.id} to={`/post/${post.id}`} className="flex justify-between items-center p-4 hover:bg-white/5 transition-all group">
                  <p className="text-sm font-bold truncate group-hover:text-red-500">{post.title}</p>
                  <span className="text-red-600 text-[10px] font-black">+{post.likes || 0}</span>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-6 text-yellow-500">
              <h4 className="font-black italic text-lg border-l-4 border-yellow-500 pl-3 uppercase">VIP 라운지</h4>
            </div>
            <div className="bg-[#111] rounded-2xl border border-yellow-500/10 divide-y divide-white/5 overflow-hidden">
              {latestVipPosts.map(post => (
                <div key={post.id} onClick={(e) => handleVipPostClick(e, post.id)} className="flex justify-between items-center p-4 hover:bg-yellow-500/5 transition-all cursor-pointer group">
                  <p className="text-sm font-bold truncate group-hover:text-yellow-500">{post.title}</p>
                  <span className="text-[9px] font-black text-yellow-600 bg-yellow-600/10 px-1.5 py-0.5 rounded italic uppercase">VIP</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-6 text-sky-500">
              <h4 className="font-black italic text-lg border-l-4 border-sky-500 pl-3 uppercase">Notice</h4>
            </div>
            <div className="space-y-3">
              {latestNotices.map(notice => (
                <Link key={notice.id} to={`/notice/${notice.id}`} className="block bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                  <p className={`text-sm font-bold truncate ${notice.is_important ? 'text-red-500' : 'text-slate-200'}`}>{notice.title}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PREMIUM STAYS */}
      <section className="max-w-[1400px] mx-auto px-6 py-24 text-white font-sans">
        <div className="bg-[#080808] rounded-[2.5rem] p-8 md:p-14 border border-white/5 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 relative z-10">
            <div>
              <h3 className="text-3xl md:text-5xl font-black italic mb-3 tracking-tighter uppercase leading-none">Premium Stays</h3>
              <p className="text-gray-500 font-bold text-sm md:text-lg">호놀자가 검증한 최고급 풀빌라 정보</p>
            </div>
            <Link to="/stores/villa" className="bg-red-600 px-12 py-5 rounded-2xl font-black text-lg shadow-xl active:scale-95 italic transition-all">예약문의</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
            {premiumHotStays.map((store: any) => (
              <Link to={`/store/${store.id}`} key={store.id} className="group relative block w-full h-[250px] md:h-[350px] overflow-hidden rounded-[2.5rem] border border-white/10 transition-all">
                <img src={store.image_url} alt={store.name} className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <h4 className="text-2xl md:text-4xl font-black text-white italic uppercase tracking-tighter mb-2 group-hover:text-red-500 transition-colors">{store.name}</h4>
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">Ho Chi Minh Villa</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 하단 제휴 배너 */}
      <section className="max-w-[1400px] mx-auto px-6 pb-24 font-sans">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#111] h-[200px] md:h-[260px] shadow-2xl">
          <div className="flex h-full transition-transform duration-1000 ease-in-out" style={{ transform: `translateX(-${currentAdIdx * 100}%)` }}>
            <div className="min-w-full h-full flex flex-col justify-center items-center text-center p-6 text-white">
              <span className="text-red-600 font-black text-[10px] uppercase tracking-[0.3em] mb-4 italic">Partnership</span>
              <h4 className="text-xl md:text-4xl font-black italic tracking-tighter leading-tight">호놀자와 함께하실 <br/> 광고주분들의 연락을 기다립니다.</h4>
            </div>
            <a href="https://t.me/honolja84" target="_blank" rel="noreferrer" className="min-w-full h-full flex flex-col justify-center items-center text-center bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] text-white">
              <span className="text-blue-500 font-black text-[10px] uppercase tracking-[0.3em] mb-4 italic">Telegram Ad</span>
              <h4 className="text-lg md:text-4xl font-black italic tracking-tighter mb-6">광고제휴 텔레그램 <span className="text-blue-400">@honolja84</span></h4>
            </a>
          </div>
        </div>
      </section>

      {/* 🟢 출석체크 성공 모달 (신규 추가) */}
      {showAttendanceModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowAttendanceModal(false)}></div>
          <div className="relative bg-[#111] border-2 border-emerald-500/30 p-10 rounded-[3rem] max-w-[320px] w-full text-center shadow-[0_0_50px_rgba(16,185,129,0.2)] transform animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">💰</span>
            </div>
            <h3 className="text-2xl font-black italic mb-2 uppercase text-emerald-500">Daily Bonus!</h3>
            <p className="text-slate-300 text-sm font-bold mb-1">오늘의 첫 방문을 환영합니다.</p>
            <p className="text-white text-lg font-black mb-8 underline decoration-emerald-500 decoration-4 underline-offset-4">+5 포인트가 적립되었습니다.</p>
            <button 
              onClick={() => setShowAttendanceModal(false)} 
              className="w-full py-4 bg-emerald-500 text-black rounded-2xl font-black text-sm hover:bg-emerald-400 transition-all shadow-lg active:scale-95"
            >
              즐겁게 놀기
            </button>
          </div>
        </div>
      )}

      {/* VIP 레벨 제한 모달 */}
      {showLevelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 font-sans">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowLevelModal(false)}></div>
          <div className="relative bg-[#111] border border-yellow-600/30 p-8 rounded-[2rem] max-w-[340px] w-full text-center shadow-2xl">
            <h3 className="text-xl font-black italic mb-2 uppercase text-yellow-500">ACCESS DENIED</h3>
            <p className="text-slate-400 text-sm font-bold mb-8">VIP 라운지는 Lv.3 이상만 입장 가능합니다.</p>
            <button onClick={() => setShowLevelModal(false)} className="w-full py-4 bg-yellow-600 text-black rounded-xl font-black text-sm hover:bg-yellow-500 transition-all">확인</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
