import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useStores } from '../hooks/useStores'; // 원래 쓰시던 훅 그대로 사용
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import StoreCard from '../components/StoreCard';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, initialized } = useAuth();
  
  // 1. Tony님의 원본 훅 호출 (컴포넌트 마운트 즉시 데이터 요청 시작)
  const { stores, loading: storesLoading } = useStores('all');
  
  const [latestPosts, setLatestPosts] = useState<any[]>([]);
  const [latestVipPosts, setLatestVipPosts] = useState<any[]>([]);
  const [latestNotices, setLatestNotices] = useState<any[]>([]);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [currentAdIdx, setCurrentAdIdx] = useState(0);

  // 인기 업소 필터링
  const hotServiceStores = useMemo(() => {
    return stores?.filter((s: any) => s.is_hot && s.category !== 'villa').slice(0, 5) || [];
  }, [stores]);

  const premiumHotStays = useMemo(() => {
    return stores?.filter((s: any) => s.category === 'villa' && s.is_hot).slice(0, 2) || [];
  }, [stores]);

  // 광고 타이머
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAdIdx((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // 게시판 데이터 가져오기 (인증 대기 없이 즉시 실행)
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
    } catch (err) {
      console.error('Home 데이터 동기화 에러:', err);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []); // 마운트 시 1회 실행

  const handleVIPClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!initialized) return; // 아직 인증 확인 중이면 클릭 방지
    if (!currentUser || currentUser.level < 3) {
      setShowLevelModal(true);
    } else {
      navigate('/vip-lounge');
    }
  };

  const handleVipPostClick = (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    if (!initialized) return;
    if (!currentUser || currentUser.level < 3) {
      setShowLevelModal(true);
    } else {
      navigate(`/post/${postId}`);
    }
  };

  // 🔴 가드 삭제: if (!initialized) return ... 부분을 없앴습니다.
  // 이제 유저는 접속하자마자 배경과 데이터 로딩 화면을 보게 됩니다.

  return (
    <div className="w-full bg-[#050505] relative overflow-hidden selection:bg-red-600/30 font-sans text-white">
      <Helmet>
        <title>호놀자 | 베트남 호치민 밤문화 & 여행의 모든 것</title>
        <meta name="description" content="베트남 호치민 밤문화, 유흥, 커뮤니티 정보 NO.1" />
      </Helmet>

      {showLevelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowLevelModal(false)}></div>
          <div className="relative bg-[#111] border border-yellow-600/30 p-8 rounded-[2rem] max-w-[340px] w-full text-center shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-black italic mb-2 uppercase text-yellow-500">ACCESS DENIED</h3>
            <p className="text-slate-400 text-sm font-bold mb-8">VIP 라운지는 베테랑(Lv.3) 이상만 입장 가능합니다.</p>
            <button onClick={() => setShowLevelModal(false)} className="w-full py-4 bg-yellow-600 text-black rounded-xl font-black text-sm hover:bg-yellow-500 transition-all">확인</button>
          </div>
        </div>
      )}

      {/* Hero 섹션 */}
      <section className="relative pt-44 pb-24 px-6 flex flex-col items-center text-center">
        <h2 className="text-7xl md:text-9xl font-black italic tracking-tighter mb-8 leading-none">
          호치민에서 <span className="text-[#FF0000] brightness-125 saturate-200 drop-shadow-[0_0_20px_rgba(255,0,0,0.4)]">놀자<span className="ml-2 md:ml-3">!</span></span>
        </h2>
        <div className="space-y-4 mb-16 z-10 px-4 flex flex-col items-center">
          <p className="text-[17px] sm:text-2xl md:text-4xl font-black tracking-tight uppercase whitespace-nowrap leading-tight">남성들을 위한 호치민의 모든 것</p>
          <p className="text-blue-500 font-black text-lg md:text-2xl italic leading-snug">실시간 정보 + 검증된 업장</p>
        </div>

        {/* 카테고리 그리드 */}
        <div className="grid grid-cols-5 gap-2 md:gap-4 max-w-5xl w-full z-10 px-2 font-sans">
          {[{ id: 'massage', name: '마사지/스파', icon: '💆‍♀️' }, { id: 'barber', name: '이발소', icon: '💈' }, { id: 'karaoke', name: '가라오케', icon: '🎤' }, { id: 'barclub', name: '바/클럽', icon: '🍸' }, { id: 'villa', name: '숙소/풀빌라', icon: '🏠' }].map((cat) => (
            <Link key={cat.id} to={`/stores/${cat.id}`} className="flex flex-col items-center gap-2 md:gap-4 p-3 md:p-10 bg-white/5 backdrop-blur-sm rounded-2xl md:rounded-[32px] border border-white/5 hover:bg-white/10 transition-all group shadow-lg">
              <span className="text-2xl md:text-5xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-[8px] md:text-sm font-black text-gray-400 group-hover:text-white uppercase tracking-tighter whitespace-nowrap">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 실시간 인기 업소 */}
      <section className="max-w-[1400px] mx-auto px-6 py-20 text-white">
        <div className="flex items-center justify-between mb-12">
          <h3 className="text-xl md:text-3xl font-black italic flex items-center gap-3">
            <span className="w-1.5 h-6 md:h-8 bg-red-600 rounded-full"></span>
            HOT 실시간 인기 업소
          </h3>
          <Link to="/stores/all" className="text-gray-400 font-bold text-[10px] md:text-sm hover:text-white underline italic">전체보기</Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {storesLoading ? 
            [1,2,3,4,5].map(i => <div key={i} className="aspect-[3/4] bg-white/5 rounded-[24px] animate-pulse" />) : 
            hotServiceStores.length > 0 ? hotServiceStores.map((store: any) => <StoreCard key={store.id} store={store} />) :
            <p className="text-gray-500 italic col-span-full py-10 text-center">인기 업소 정보를 불러오고 있습니다...</p>
          }
        </div>
      </section>

      {/* SNS & 게시판 */}
      <section className="max-w-[1400px] mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 font-sans text-white">
        <div className="lg:col-span-2 flex flex-row lg:flex-col gap-4">
          <a href="https://t.me/honolja" target="_blank" rel="noreferrer" className="flex-1 bg-[#0088cc] rounded-[1.5rem] p-6 relative overflow-hidden group hover:scale-[1.03] transition-all shadow-xl flex flex-col justify-center min-h-[140px]">
            <span className="text-[8px] md:text-[10px] font-black text-white/60 uppercase block mb-1 italic">Channel</span>
            <h4 className="text-sm md:text-xl font-black italic text-white tracking-tighter relative z-10 leading-tight">호놀자 텔레그램</h4>
          </a>
          <a href="https://open.kakao.com/o/gx4EsPRg" target="_blank" rel="noreferrer" className="flex-1 bg-[#FEE500] rounded-[1.5rem] p-6 relative overflow-hidden group hover:scale-[1.03] transition-all text-black shadow-xl flex flex-col justify-center min-h-[140px]">
            <span className="text-[8px] md:text-[10px] font-black text-black/40 uppercase block mb-1 italic">Open Chat</span>
            <h4 className="text-sm md:text-xl font-black italic tracking-tighter relative z-10 leading-tight">호놀자 카카오톡</h4>
          </a>
        </div>

        <div className="lg:col-span-10 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-black italic text-lg border-l-4 border-red-600 pl-3 uppercase">Community</h4>
              <Link to="/community" className="text-[10px] text-gray-300 font-bold underline hover:text-white uppercase italic">더보기</Link>
            </div>
            <div className="bg-[#111] rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden shadow-2xl">
              {latestPosts.length > 0 ? latestPosts.map(post => (
                <Link key={post.id} to={`/post/${post.id}`} className="flex justify-between items-center p-4 hover:bg-white/5 transition-all group">
                  <div className="min-w-0 pr-4"><p className="text-sm font-bold group-hover:text-red-500 truncate text-slate-200">{post.title}</p></div>
                  <span className="text-red-600 text-[10px] font-black">+{post.likes || 0}</span>
                </Link>
              )) : <p className="p-4 text-xs text-gray-600 italic text-center">불러오는 중...</p>}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-black italic text-lg border-l-4 border-yellow-500 pl-3 uppercase text-yellow-500">VIP 라운지</h4>
              <button onClick={handleVIPClick} className="text-[10px] text-gray-300 font-bold underline hover:text-white uppercase italic">더보기</button>
            </div>
            <div className="bg-[#111] rounded-2xl border border-yellow-500/10 divide-y divide-white/5 overflow-hidden shadow-2xl">
              {latestVipPosts.length > 0 ? latestVipPosts.map(post => (
                <div key={post.id} onClick={(e) => handleVipPostClick(e, post.id)} className="flex justify-between items-center p-4 hover:bg-yellow-500/5 transition-all cursor-pointer group">
                  <div className="min-w-0 pr-4"><p className="text-sm font-bold group-hover:text-yellow-500 truncate text-slate-200">{post.title}</p></div>
                  <span className="text-[9px] font-black text-yellow-600 bg-yellow-600/10 px-1.5 py-0.5 rounded italic uppercase">VIP</span>
                </div>
              )) : <p className="p-4 text-xs text-gray-600 italic text-center">불러오는 중...</p>}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-black italic text-lg border-l-4 border-sky-500 pl-3 uppercase text-sky-500">Notice</h4>
              <Link to="/notice" className="text-[10px] text-gray-300 font-bold underline hover:text-white uppercase italic">더보기</Link>
            </div>
            <div className="space-y-3">
              {latestNotices.length > 0 ? latestNotices.map(notice => (
                <Link key={notice.id} to={`/notice/${notice.id}`} className="block bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all shadow-xl">
                  <p className={`text-sm font-bold truncate ${notice.is_important ? 'text-red-500' : 'text-slate-200'}`}>{notice.title}</p>
                </Link>
              )) : <p className="p-4 text-xs text-gray-600 italic text-center">불러오는 중...</p>}
            </div>
          </div>
        </div>
      </section>

      {/* PREMIUM STAYS */}
      <section className="max-w-[1400px] mx-auto px-6 py-24 font-sans text-white">
        <div className="bg-[#080808] rounded-[2.5rem] p-8 md:p-14 border border-white/5 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 relative z-10">
            <div>
              <h3 className="text-3xl md:text-5xl font-black italic mb-3 tracking-tighter uppercase leading-none">Premium Stays</h3>
              <p className="text-gray-500 font-bold text-sm md:text-lg">호놀자가 검증한 최고급 풀빌라 정보</p>
            </div>
            <Link to="/stores/villa" className="w-full md:w-auto text-center bg-red-600 px-12 py-5 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all italic">예약문의</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
            {storesLoading ? [1, 2].map(i => <div key={i} className="h-[200px] bg-white/5 rounded-[2.5rem] animate-pulse" />) : 
              premiumHotStays.map((store: any) => (
                <div key={store.id} className="block group w-full h-[200px] md:h-[260px] overflow-hidden rounded-[2.5rem] border border-white/10 relative shadow-2xl bg-black">
                  <img src={store.image_url} className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30" alt="bg" />
                  <div className="w-full h-full flex items-center justify-center p-2 relative z-10 transform transition-transform duration-700 group-hover:scale-105">
                    <StoreCard store={store} />
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </section>

      {/* 하단 배너 */}
      <section className="max-w-[1400px] mx-auto px-6 pb-24 font-sans">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#111] h-[200px] md:h-[260px] shadow-2xl flex flex-col justify-center items-center text-center p-10">
           <h4 className="text-white text-xl md:text-4xl font-black italic tracking-tighter leading-tight mb-4">호놀자와 함께하실 <br/> 광고주분들의 연락을 기다립니다.</h4>
           <p className="text-blue-400 font-black text-lg md:text-2xl italic">텔레그램 @honolja84</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
