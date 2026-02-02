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
  const { currentUser, loading: authLoading } = useAuth();
  
  // 1. 기존 업소 데이터 훅 유지 (내부에 setLoading logic이 있음을 전제)
  const { stores, loading: storesLoading } = useStores('all');
  
  const [latestPosts, setLatestPosts] = useState<any[]>([]);
  const [latestNotices, setLatestNotices] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showLevelModal, setShowLevelModal] = useState(false);

  // 데이터 필터링 (메모리 내 계산)
  const hotStores = stores.filter(s => s.is_hot).slice(0, 5);
  const villaStores = stores.filter(s => s.category === 'villa').slice(0, 2);

  /**
   * 🔴 [방탄 fetch] 메인 페이지 통합 데이터 로드
   * 최신글과 공지사항을 병렬로 가져와 속도를 높이고, 
   * 어떤 에러가 나도 finally에서 로딩을 해제합니다.
   */
  const fetchHomeData = async () => {
    setDataLoading(true);
    try {
      // 병렬 호출로 속도 최적화
      const [postRes, noticeRes] = await Promise.all([
        supabase
          .from('posts')
          .select('*, author:profiles(nickname)')
          .order('created_at', { ascending: false })
          .limit(4),
        supabase
          .from('notices')
          .select('*')
          .order('is_important', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(2)
      ]);

      if (postRes.error) throw postRes.error;
      if (noticeRes.error) throw noticeRes.error;

      if (postRes.data) setLatestPosts(postRes.data);
      if (noticeRes.data) setLatestNotices(noticeRes.data);

    } catch (err: any) {
      console.error("Home Intelligence Load Failed (406 등):", err.message);
    } finally {
      // 🔴 핵심: 성공/실패 여부와 상관없이 무조건 로딩 종료
      setDataLoading(false);
    }
  };

  /**
   * 🔴 [데이터 가드 적용] 
   * 인증이 확정된 후 최적의 타이밍에 데이터를 호출합니다.
   */
  useFetchGuard(fetchHomeData, []);

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

  // 🔴 전역 인증 확인 중일 때의 블랙스크린 방지
  if (authLoading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-red-600 font-black animate-pulse tracking-[0.3em] text-xl italic">
        HONOLJA INITIALIZING...
      </div>
    </div>
  );

  return (
    <div className="w-full bg-[#050505] relative overflow-hidden selection:bg-red-600/30 font-sans">
      
      {/* [모달] VIP 등급 제한 알림 */}
      {showLevelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowLevelModal(false)}></div>
          <div className="relative bg-[#0f0f0f] border border-yellow-600/30 p-10 rounded-[3rem] max-w-[380px] w-full text-center shadow-[0_0_50px_rgba(202,138,4,0.15)]">
            <div className="w-20 h-20 bg-yellow-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-yellow-600/20 shadow-inner">
              <span className="text-4xl">🔒</span>
            </div>
            <h3 className="text-2xl font-black text-white italic mb-3 uppercase tracking-tighter">VIP LOUNGE RESTRICTED</h3>
            <p className="text-slate-400 text-sm font-bold mb-10 leading-relaxed italic">
              VIP 라운지는 베테랑(Lv.3) 이상 정예 대원만<br/>접근 가능합니다. 활동을 통해 등급을 올려주세요!
            </p>
            <div className="space-y-4">
              <button onClick={() => setShowLevelModal(false)} className="w-full py-5 bg-yellow-600 text-black rounded-2xl font-black text-sm hover:bg-yellow-500 transition-all uppercase italic shadow-xl shadow-yellow-900/40">확인</button>
              <button onClick={hideForAWeek} className="text-[10px] text-slate-600 hover:text-slate-400 underline font-black uppercase italic tracking-widest"> 일주일 동안 보지 않기 </button>
            </div>
          </div>
        </div>
      )}

      {/* [섹션 1] Hero */}
      <section className="relative pt-44 pb-24 px-6 flex flex-col items-center text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.08)_0%,transparent_70%)] pointer-events-none"></div>
        <h2 className="text-7xl md:text-9xl font-black italic tracking-tighter mb-8 leading-none text-white uppercase">
          HOCHIMINH <span className="text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.6)]">NOLA!</span>
        </h2>
        <div className="space-y-4 mb-16 z-10">
          <p className="text-2xl md:text-4xl font-black tracking-tight text-white uppercase drop-shadow-md italic">남성들을 위한 호치민 최고의 가이드</p>
          <div className="space-y-1">
            <p className="text-blue-500 font-black text-lg md:text-2xl italic tracking-tight">실시간 정보 + 검증된 업장 + 그 이상의 즐거움(α)</p>
            <p className="text-cyan-400 font-bold text-sm md:text-lg opacity-90 uppercase tracking-[0.2em] italic">Villa · Apartment · Premium Vehicle</p>
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
            <Link key={cat.id} to={`/stores/${cat.id}`} className="flex flex-col items-center gap-4 p-6 md:p-10 bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] border border-white/5 hover:bg-white/10 hover:border-red-600/30 transition-all group shadow-2xl">
              <span className="text-3xl md:text-5xl group-hover:scale-110 transition-transform duration-500">{cat.icon}</span>
              <span className="text-[10px] md:text-xs font-black text-gray-400 group-hover:text-white uppercase tracking-tighter italic">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* [섹션 2] HOT 인기 업소 */}
      <section className="max-w-[1500px] mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-12 px-2">
          <h3 className="text-3xl md:text-4xl font-black italic flex items-center gap-4 text-white uppercase tracking-tighter">
            <span className="w-2 h-10 bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)]"></span>
            HOT Intelligence
          </h3>
          <Link to="/stores/all" className="text-gray-500 font-black text-xs hover:text-white border-b border-gray-800 hover:border-white pb-1 transition-all italic uppercase tracking-widest">View All</Link>
        </div>
        
        {storesLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
            {[1,2,3,4,5].map(i => <div key={i} className="aspect-[3/4.2] bg-white/5 rounded-[2.5rem] animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 animate-in fade-in duration-1000">
            {hotStores.map(store => <StoreCard key={store.id} store={store} />)}
          </div>
        )}
      </section>

      {/* [섹션 3] 커뮤니티 & VIP 라운지 */}
      <section className="max-w-[1500px] mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-2 flex lg:flex-col gap-6">
          <a href={SNS_LINKS.telegram} target="_blank" rel="noreferrer" className="flex-1 bg-[#0088cc] rounded-[2.5rem] p-10 relative overflow-hidden group hover:scale-[1.03] transition-all shadow-xl">
            <span className="text-[10px] font-black text-white/40 uppercase block mb-2 italic tracking-widest">Telegram</span>
            <h4 className="text-2xl font-black italic text-white leading-tight uppercase">Group<br/>Terminal</h4>
            <span className="absolute -bottom-6 -right-4 text-[10rem] font-black text-white/5 italic select-none">T</span>
          </a>
          <a href={SNS_LINKS.kakao} target="_blank" rel="noreferrer" className="flex-1 bg-[#FEE500] rounded-[2.5rem] p-10 relative overflow-hidden group hover:scale-[1.03] transition-all text-black shadow-xl">
            <span className="text-[10px] font-black text-black/40 uppercase block mb-2 italic tracking-widest">KakaoTalk</span>
            <h4 className="text-2xl font-black italic leading-tight uppercase">Base<br/>Camp</h4>
            <span className="absolute -bottom-6 -right-4 text-[10rem] font-black text-black/5 italic select-none">K</span>
          </a>
        </div>

        <div className="lg:col-span-10 grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Community */}
          <div>
            <div className="flex justify-between items-center mb-6 px-2">
              <h4 className="font-black italic text-xl border-l-4 border-red-600 pl-4 uppercase text-white tracking-tighter">Community</h4>
              <Link to="/community" className="text-[10px] text-gray-600 font-bold hover:text-white transition-colors italic uppercase tracking-widest">더보기</Link>
            </div>
            <div className="bg-[#0f0f0f] rounded-[2rem] border border-white/5 divide-y divide-white/5 overflow-hidden shadow-2xl">
              {dataLoading ? [1,2,3,4].map(i => <div key={i} className="h-20 bg-white/5 animate-pulse" />) : latestPosts.map(post => (
                <Link key={post.id} to={`/post/${post.id}`} className="flex justify-between items-center p-6 hover:bg-white/5 transition-all group">
                  <div className="min-w-0 pr-4">
                    <p className="text-sm font-bold group-hover:text-red-500 truncate mb-1 text-slate-200 italic">{post.title}</p>
                    <span className="text-[10px] text-gray-600 font-bold tracking-tighter italic uppercase">{post.author?.nickname || 'Agent'} · {new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className="text-red-900 text-[10px] font-black">+{post.likes || 0}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* VIP Lounge Preview */}
          <div>
            <div className="flex justify-between items-center mb-6 px-2">
              <h4 className="font-black italic text-xl border-l-4 border-yellow-500 pl-4 uppercase text-yellow-500 tracking-tighter">VIP Lounge</h4>
              <button onClick={handleVIPClick} className="text-[10px] text-gray-600 font-bold hover:text-white transition-colors uppercase italic tracking-widest">Access</button>
            </div>
            <div className="bg-[#0f0f0f] rounded-[2rem] border border-yellow-500/10 divide-y divide-white/5 overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.05)]">
              {[1, 2, 3, 4].map(i => (
                <div key={i} onClick={handleVIPClick} className="flex justify-between items-center p-6 hover:bg-yellow-500/5 transition-all cursor-pointer group">
                  <div className="min-w-0 pr-4">
                    <p className="text-sm font-bold group-hover:text-yellow-500 truncate mb-1 text-slate-200 italic"><span className="text-yellow-600 mr-2">[SECURED]</span> 기밀 정보 암호화됨</p>
                    <span className="text-[10px] text-gray-700 font-bold tracking-tighter uppercase italic">Restricted Access · Classified</span>
                  </div>
                  <span className="text-[9px] font-black text-yellow-600 bg-yellow-600/10 px-2 py-1 rounded-lg italic uppercase">VIP</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notices */}
          <div>
            <div className="flex justify-between items-center mb-6 px-2">
              <h4 className="font-black italic text-xl border-l-4 border-sky-500 pl-4 uppercase text-sky-500 tracking-tighter">Notice</h4>
              <Link to="/notice" className="text-[10px] text-gray-600 font-bold hover:text-white transition-colors italic uppercase tracking-widest">더보기</Link>
            </div>
            <div className="space-y-4">
              {dataLoading ? [1,2].map(i => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl" />) : latestNotices.map(notice => (
                <Link key={notice.id} to="/notice" className="block bg-[#0f0f0f] p-6 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all cursor-pointer shadow-xl">
                  <p className={`text-sm font-bold mb-3 truncate italic ${notice.is_important ? 'text-red-500' : 'text-slate-200'}`}>
                    {notice.is_important && '[필독] '}{notice.title}
                  </p>
                  <div className="flex justify-between text-[10px] text-gray-600 font-black italic uppercase tracking-widest">
                    <span>{new Date(notice.created_at).toLocaleDateString()}</span>
                    <span className="text-sky-600">HQ Official</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* [섹션 4] PREMIUM STAYS */}
      <section className="max-w-[1500px] mx-auto px-6 py-24 mb-20">
        <div className="bg-[#080808] rounded-[4rem] p-12 md:p-20 border border-white/5 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.03)_0%,transparent_50%)]"></div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 relative z-10 px-4">
            <div>
              <h3 className="text-4xl md:text-6xl font-black italic mb-4 tracking-tighter text-white uppercase leading-none">Premium Stays</h3>
              <p className="text-gray-500 font-bold text-base md:text-xl italic uppercase tracking-tight">호놀자가 엄선한 최고급 풀빌라 및 의전 서비스</p>
            </div>
            <Link to="/stores/villa" className="bg-red-600 hover:bg-white hover:text-red-600 px-12 py-5 rounded-2xl font-black text-base text-white shadow-2xl shadow-red-900/40 active:scale-95 transition-all uppercase italic">
              Book Intelligence
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10 px-4">
            {storesLoading ? (
              [1, 2].map(i => <div key={i} className="aspect-video bg-white/5 rounded-[3rem] animate-pulse" />)
            ) : villaStores.length > 0 ? (
              villaStores.map(store => (
                <div key={store.id} className="w-full transform transition-transform hover:scale-[1.02] duration-500">
                  <StoreCard store={store} />
                </div>
              ))
            ) : (
              <div className="col-span-2 py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-black/20">
                <p className="text-gray-700 font-black italic uppercase tracking-[0.3em]">No Premium Assets Registered in this Sector.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
