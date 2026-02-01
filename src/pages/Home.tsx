import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStores } from '../hooks/useStores';
import { supabase } from '../supabase';
import { SNS_LINKS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useFetchGuard } from '../hooks/useFetchGuard';
import StoreCard from '../components/StoreCard';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const { stores, loading: storesLoading } = useStores('all');
  const [latestPosts, setLatestPosts] = useState<any[]>([]);
  const [latestNotices, setLatestNotices] = useState<any[]>([]);
  const [showLevelModal, setShowLevelModal] = useState(false);

  // 1. HOT 인기업소 필터링
  const hotStores = stores.filter(s => s.is_hot).slice(0, 5);

  // 2. 하단 Premium Stays용 숙소/풀빌라 데이터 필터링 (최신순 2개)
  const villaStores = stores.filter(s => s.category === 'villa').slice(0, 2);

  useFetchGuard(async () => {
    // 최신 커뮤니티 글 4개
    const { data: posts } = await supabase
      .from('posts')
      .select('*, author:profiles(nickname)')
      .order('created_at', { ascending: false })
      .limit(4);
    if (posts) setLatestPosts(posts);

    // 최신 공지사항 2개
    const { data: notices } = await supabase
      .from('notices')
      .select('*')
      .order('is_important', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(2);
    if (notices) setLatestNotices(notices);
  }, []);

  const handleVIPClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUser || currentUser.level < 3) {
      setShowLevelModal(true);
    } else {
      navigate('/vip-lounge');
    }
  };

  const hideForAWeek = () => {
    const oneWeekLater = new Date().getTime() + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem('hideVeteranNoticeUntil', oneWeekLater.toString());
    setShowLevelModal(false);
  };

  return (
    <div className="w-full bg-[#050505] relative overflow-hidden selection:bg-red-600/30">
      
      {/* [모달] VIP 등급 제한 알림 */}
      {showLevelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowLevelModal(false)}></div>
          <div className="relative bg-[#111] border border-yellow-600/30 p-8 rounded-[2rem] max-w-[340px] w-full text-center shadow-2xl animate-in zoom-in duration-200">
            <div className="w-14 h-14 bg-yellow-600/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-yellow-600/20">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-xl font-black text-white italic mb-2 uppercase tracking-tighter">VIP LOUNGE ONLY</h3>
            <p className="text-slate-400 text-sm font-bold mb-8">VIP 라운지는 베테랑(Lv.3) 이상만 입장 가능합니다.<br/>활동을 통해 등급을 올려주세요!</p>
            <div className="space-y-4">
              <button onClick={() => setShowLevelModal(false)} className="w-full py-4 bg-yellow-600 text-black rounded-xl font-black text-sm hover:bg-yellow-500 transition-all">확인</button>
              <button onClick={hideForAWeek} className="text-xs text-slate-600 hover:text-slate-400 underline font-bold">일주일 동안 보지 않기</button>
            </div>
          </div>
        </div>
      )}

      {/* [섹션 1] Hero */}
      <section className="relative pt-44 pb-24 px-6 flex flex-col items-center text-center">
        <h2 className="text-7xl md:text-9xl font-black italic tracking-tighter mb-8 leading-none">
          호치민에서 <span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">놀자!</span>
        </h2>
        <div className="space-y-4 mb-16 z-10">
          <p className="text-2xl md:text-4xl font-black tracking-tight text-white uppercase drop-shadow-md">남성들을 위한 호치민의 모든 것</p>
          <div className="space-y-1">
            <p className="text-blue-500 font-black text-lg md:text-2xl italic">실시간 정보 + 검증된 업장 + 그 이상의 즐거움(α)</p>
            <p className="text-cyan-400 font-bold text-sm md:text-lg opacity-90">풀빌라 · 아파트 예약까지 한번에 !</p>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 max-w-5xl w-full z-10 px-4">
          {[
            { id: 'massage', name: '마사지/스파', icon: '💆‍♀️' },
            { id: 'barber', name: '이발소', icon: '💈' },
            { id: 'karaoke', name: '가라오케', icon: '🎤' },
            { id: 'barclub', name: '바/클럽', icon: '🍸' },
            { id: 'villa', name: '숙소/풀빌라', icon: '🏠' },
          ].map((cat) => (
            <Link key={cat.id} to={`/stores/${cat.id}`} className="flex flex-col items-center gap-4 p-6 md:p-10 bg-white/5 backdrop-blur-sm rounded-[32px] border border-white/5 hover:bg-white/10 hover:border-red-600/30 transition-all group">
              <span className="text-3xl md:text-5xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-[10px] md:text-sm font-black text-gray-400 group-hover:text-white uppercase tracking-tighter">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* [섹션 2] HOT 인기 업소 */}
      <section className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-12">
          <h3 className="text-3xl font-black italic flex items-center gap-3 text-white">
            <span className="w-1.5 h-8 bg-red-600 rounded-full"></span>
            HOT 실시간 인기 업소
          </h3>
          <Link to="/stores/all" className="text-gray-500 font-bold text-sm hover:text-white underline italic">전체보기</Link>
        </div>
        
        {storesLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
            {[1,2,3,4,5].map(i => <div key={i} className="aspect-[3/4] bg-white/5 rounded-[24px] animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
            {hotStores.map(store => <StoreCard key={store.id} store={store} />)}
          </div>
        )}
      </section>

      {/* [섹션 3] 커뮤니티 & VIP 라운지 */}
      <section className="max-w-[1400px] mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-2 flex lg:flex-col gap-4">
          <a href={SNS_LINKS.telegram} target="_blank" className="flex-1 bg-[#0088cc] rounded-[2rem] p-8 relative overflow-hidden group hover:scale-[1.03] transition-all shadow-xl">
            <span className="text-[10px] font-black text-white/50 uppercase block mb-1">Telegram</span>
            <h4 className="text-xl font-black italic text-white leading-tight">그룹챗 입장</h4>
            <span className="absolute -bottom-4 -right-2 text-9xl font-black text-white/5 italic select-none">H</span>
          </a>
          <a href={SNS_LINKS.kakao} target="_blank" className="flex-1 bg-[#FEE500] rounded-[2rem] p-8 relative overflow-hidden group hover:scale-[1.03] transition-all text-black shadow-xl">
            <span className="text-[10px] font-black text-black/40 uppercase block mb-1">KakaoTalk</span>
            <h4 className="text-xl font-black italic leading-tight">단톡방 입장</h4>
            <span className="absolute -bottom-4 -right-2 text-9xl font-black text-black/5 italic select-none">H</span>
          </a>
        </div>

        <div className="lg:col-span-10 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-black italic text-lg border-l-4 border-red-600 pl-3 uppercase text-white">Community</h4>
              <Link to="/community" className="text-[10px] text-gray-600 font-bold underline hover:text-white transition-colors">더보기</Link>
            </div>
            <div className="bg-[#111] rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden">
              {latestPosts.map(post => (
                <Link key={post.id} to={`/post/${post.id}`} className="flex justify-between items-center p-4 hover:bg-white/5 transition-all group">
                  <div className="min-w-0 pr-4">
                    <p className="text-sm font-bold group-hover:text-red-500 truncate mb-1 text-slate-200">{post.title}</p>
                    <span className="text-[10px] text-gray-600 font-bold tracking-tighter">{post.author?.nickname || 'Guest'} · {new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className="text-red-800 text-[10px] font-black">+{post.likes || 0}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* 🔴 VIP 라운지 섹션 수정 완료 */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-black italic text-lg border-l-4 border-yellow-500 pl-3 uppercase text-yellow-500">VIP 라운지</h4>
              <button onClick={handleVIPClick} className="text-[10px] text-gray-600 font-bold underline hover:text-white transition-colors uppercase italic">Access</button>
            </div>
            <div className="bg-[#111] rounded-2xl border border-yellow-500/10 divide-y divide-white/5 overflow-hidden shadow-[0_0_20px_rgba(234,179,8,0.05)]">
              {[1, 2, 3, 4].map(i => (
                <div key={i} onClick={handleVIPClick} className="flex justify-between items-center p-4 hover:bg-yellow-500/5 transition-all cursor-pointer group">
                  <div className="min-w-0 pr-4">
                    <p className="text-sm font-bold group-hover:text-yellow-500 truncate mb-1 text-slate-200"><span className="text-yellow-600 mr-1.5">[VIP]</span> 기밀 정보 보호됨</p>
                    <span className="text-[10px] text-gray-600 font-bold tracking-tighter">비공개 · 방금 전</span>
                  </div>
                  <span className="text-[9px] font-black text-yellow-600 bg-yellow-600/10 px-1.5 py-0.5 rounded italic uppercase">VIP</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-black italic text-lg border-l-4 border-sky-500 pl-3 uppercase text-sky-500">Notice</h4>
              <Link to="/notice" className="text-[10px] text-gray-600 font-bold underline hover:text-white transition-colors">더보기</Link>
            </div>
            <div className="space-y-3">
              {latestNotices.map(notice => (
                <Link key={notice.id} to="/notice" className="block bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
                  <p className={`text-sm font-bold mb-2 truncate ${notice.is_important ? 'text-red-500' : 'text-slate-200'}`}>
                    {notice.is_important && '[필독] '}{notice.title}
                  </p>
                  <div className="flex justify-between text-[10px] text-gray-600 font-bold">
                    <span>{new Date(notice.created_at).toLocaleDateString()}</span>
                    <span>본부 공지</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* [섹션 4] PREMIUM STAYS 🔴 데이터 연동 및 링크 수정 완료 */}
      <section className="max-w-[1400px] mx-auto px-6 py-24 mb-20">
        <div className="bg-[#080808] rounded-[3rem] p-12 border border-white/5 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10 px-4">
            <div>
              <h3 className="text-4xl font-black italic mb-2 tracking-tighter text-white uppercase leading-none">Premium Stays</h3>
              <p className="text-gray-500 font-bold text-sm md:text-base">호놀자가 검증한 최고급 풀빌라와 차량 서비스</p>
            </div>
            {/* 🔴 숙소/풀빌라 리스트 페이지로 연결 */}
            <Link to="/stores/villa" className="bg-red-600 hover:bg-red-700 px-10 py-4 rounded-2xl font-black text-sm text-white shadow-xl shadow-red-600/20 active:scale-95 transition-all">
              예약문의
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10 px-4">
            {storesLoading ? (
              [1, 2].map(i => <div key={i} className="aspect-video bg-white/5 rounded-[2.5rem] animate-pulse" />)
            ) : villaStores.length > 0 ? (
              villaStores.map(store => (
                <div key={store.id} className="w-full">
                  <StoreCard store={store} />
                </div>
              ))
            ) : (
              /* 데이터가 없을 경우를 대비한 가이드 박스 */
              <div className="col-span-2 py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
                <p className="text-gray-600 font-bold italic">현재 등록된 추천 숙소가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
