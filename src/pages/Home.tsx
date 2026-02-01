import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStores } from '../hooks/useStores';
import { supabase } from '../supabase';
import { SNS_LINKS, BRAND_NAME } from '../constants';
import { useAuth } from '../contexts/AuthContext'; // 🔴 임포트 추가
import { useFetchGuard } from '../hooks/useFetchGuard'; // 🔴 임포트 추가
import StoreCard from '../components/StoreCard';

const Home: React.FC = () => {
  const navigate = useNavigate();
  // 1. 전역 인증 정보 구독
  const { currentUser, loading: authLoading } = useAuth();
  
  // 2. 실시간 데이터 상태
  const { stores, loading: storesLoading } = useStores('all');
  const [latestPosts, setLatestPosts] = useState<any[]>([]);
  const [latestNotices, setLatestNotices] = useState<any[]>([]);
  const [showLevelModal, setShowLevelModal] = useState(false);

  // 3. 인기업소(HOT) 필터링
  const hotStores = stores.filter(s => s.is_hot).slice(0, 5);

  // 4. [데이터 가드] 메인 페이지에 필요한 실시간 피드 낚아오기
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

  // 베테랑 클릭 핸들러 (실제 등급 체크 적용)
  const handleVeteranClick = (e: React.MouseEvent) => {
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
      
      {/* [모달] 베테랑 등급 제한 알림 */}
      {showLevelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowLevelModal(false)}></div>
          <div className="relative bg-[#111] border border-yellow-600/30 p-8 rounded-[2rem] max-w-[340px] w-full text-center shadow-2xl animate-in zoom-in duration-200">
            <div className="w-14 h-14 bg-yellow-600/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-yellow-600/20">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-xl font-black text-white italic mb-2 uppercase tracking-tighter">VETERAN ONLY</h3>
            <p className="text-slate-400 text-sm font-bold mb-8 italic">베테랑(Lv.3) 회원 전용 정보입니다.<br/>활동을 통해 등급을 올려주세요!</p>
            <div className="space-y-4">
              <button onClick={() => setShowLevelModal(false)} className="w-full py-4 bg-yellow-600 text-black rounded-xl font-black text-sm hover:bg-yellow-500 transition-all uppercase italic">Confirm</button>
              <button onClick={hideForAWeek} className="text-xs text-slate-600 hover:text-slate-400 underline font-bold italic">Hide for a week</button>
            </div>
          </div>
        </div>
      )}

      {/* [섹션 1] Hero */}
      <section className="relative pt-44 pb-24 px-6 flex flex-col items-center text-center">
        <h2 className="text-7xl md:text-9xl font-black italic tracking-tighter mb-8 leading-none uppercase">
          SAIGON <span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">INTELLIGENCE</span>
        </h2>
        <div className="space-y-4 mb-16 z-10">
          <p className="text-2xl md:text-4xl font-black tracking-tight text-white uppercase italic">남성들을 위한 호치민 최고의 가이드</p>
          <div className="space-y-1">
            <p className="text-blue-500 font-black text-lg md:text-2xl italic uppercase tracking-widest">Real-time Data + Verified Stores</p>
            <p className="text-cyan-400 font-bold text-sm md:text-lg opacity-90 italic uppercase">Pool Villas · Apartments · Luxury Escapes</p>
          </div>
        </div>

        {/* 카테고리 메뉴 */}
        <div className="grid grid-cols-5 gap-4 max-w-5xl w-full z-10 px-4">
          {[
            { id: 'massage', name: 'Massage', icon: '💆‍♀️' },
            { id: 'barber', name: 'Barber', icon: '💈' },
            { id: 'karaoke', name: 'Karaoke', icon: '🎤' },
            { id: 'barclub', name: 'Bar/Club', icon: '🍸' },
            { id: 'villa', name: 'Stay', icon: '🏠' },
          ].map((cat) => (
            <Link key={cat.id} to={`/stores/${cat.id}`} className="flex flex-col items-center gap-4 p-6 md:p-10 bg-white/[0.03] backdrop-blur-sm rounded-[32px] border border-white/5 hover:bg-white/10 hover:border-red-600/30 transition-all group">
              <span className="text-3xl md:text-5xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-[9px] md:text-xs font-black text-gray-400 group-hover:text-white uppercase tracking-widest italic">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* [섹션 2] HOT Stores */}
      <section className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-12 border-l-4 border-red-600 pl-6">
          <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">
            HOT Real-time Intelligence
          </h3>
          <Link to="/stores/all" className="text-gray-600 font-black text-[10px] uppercase italic tracking-widest hover:text-red-600 transition-colors underline">View All Stores</Link>
        </div>
        
        {storesLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
            {[1,2,3,4,5].map(i => <div key={i} className="aspect-[3/4] bg-white/5 rounded-[2rem] animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 animate-in fade-in duration-1000">
            {hotStores.map(store => <StoreCard key={store.id} store={store} />)}
          </div>
        )}
      </section>

      {/* [섹션 3] 실시간 피드 (진짜 데이터 연동) */}
      <section className="max-w-[1400px] mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* 좌측 SNS */}
        <div className="lg:col-span-2 flex lg:flex-col gap-4">
          <a href={SNS_LINKS.telegram} target="_blank" className="flex-1 bg-[#0088cc] rounded-[2.5rem] p-8 relative overflow-hidden group hover:scale-[1.03] transition-all shadow-xl">
            <span className="text-[9px] font-black text-white/50 uppercase block mb-1 italic tracking-widest">Telegram</span>
            <h4 className="text-xl font-black italic text-white leading-tight uppercase">Join Group</h4>
            <span className="absolute -bottom-4 -right-2 text-9xl font-black text-white/5 italic select-none">T</span>
          </a>
          <a href={SNS_LINKS.kakao} target="_blank" className="flex-1 bg-[#FEE500] rounded-[2.5rem] p-8 relative overflow-hidden group hover:scale-[1.03] transition-all text-black shadow-xl">
            <span className="text-[9px] font-black text-black/40 uppercase block mb-1 italic tracking-widest">KakaoTalk</span>
            <h4 className="text-xl font-black italic leading-tight uppercase">Open Chat</h4>
            <span className="absolute -bottom-4 -right-2 text-9xl font-black text-black/5 italic select-none">K</span>
          </a>
        </div>

        {/* 게시판 리스트 */}
        <div className="lg:col-span-10 grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Community */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-black italic text-lg border-l-4 border-red-600 pl-3 uppercase text-white">Community Feed</h4>
              <Link to="/community" className="text-[9px] text-gray-600 font-black uppercase italic hover:text-white transition-colors">More</Link>
            </div>
            <div className="bg-[#111] rounded-[2rem] border border-white/5 divide-y divide-white/5 overflow-hidden shadow-2xl">
              {latestPosts.map(post => (
                <Link key={post.id} to={`/post/${post.id}`} className="flex justify-between items-center p-5 hover:bg-white/[0.03] transition-all group">
                  <div className="min-w-0 pr-4">
                    <p className="text-sm font-bold group-hover:text-red-500 truncate mb-1 text-slate-300 italic">{post.title}</p>
                    <span className="text-[9px] text-gray-600 font-black uppercase italic tracking-tighter">{post.author?.nickname || 'Guest'} · {new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className="text-red-900 text-[10px] font-black italic">+{post.likes || 0}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Veteran */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-black italic text-lg border-l-4 border-yellow-500 pl-3 uppercase text-yellow-500">Veteran Intel</h4>
              <button onClick={handleVeteranClick} className="text-[9px] text-gray-600 font-black uppercase italic hover:text-white transition-colors">Lock</button>
            </div>
            <div className="bg-[#111] rounded-[2rem] border border-yellow-500/10 divide-y divide-white/5 overflow-hidden shadow-2xl">
              {[1, 2, 3, 4].map(i => (
                <div key={i} onClick={handleVeteranClick} className="flex justify-between items-center p-5 hover:bg-yellow-500/[0.02] transition-all cursor-pointer group">
                  <div className="min-w-0 pr-4">
                    <p className="text-sm font-bold group-hover:text-yellow-500 truncate mb-1 text-slate-400 italic">Encrypted Intelligence File #{i}</p>
                    <span className="text-[9px] text-gray-700 font-black uppercase italic tracking-tighter">Classified · Level 3 Only</span>
                  </div>
                  <span className="text-[8px] font-black text-yellow-600/50 border border-yellow-600/20 px-1.5 py-0.5 rounded italic uppercase">Locked</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notice */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-black italic text-lg border-l-4 border-sky-500 pl-3 uppercase text-sky-500">Notice</h4>
              <Link to="/notice" className="text-[9px] text-gray-600 font-black uppercase italic hover:text-white transition-colors">More</Link>
            </div>
            <div className="space-y-3">
              {latestNotices.map(notice => (
                <Link key={notice.id} to="/notice" className="block bg-white/[0.02] p-5 rounded-2xl border border-white/5 hover:border-sky-500/30 transition-all shadow-xl">
                  <p className={`text-sm font-black mb-2 truncate italic ${notice.is_important ? 'text-red-500' : 'text-slate-300'}`}>
                    {notice.is_important && '[HOT] '}{notice.title}
                  </p>
                  <div className="flex justify-between text-[9px] text-gray-600 font-black uppercase italic tracking-widest">
                    <span>{new Date(notice.created_at).toLocaleDateString()}</span>
                    <span>Admin HQ</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* [섹션 4] PREMIUM STAYS */}
      <section className="max-w-[1400px] mx-auto px-6 py-24 mb-20">
        <div className="bg-[#080808] rounded-[3.5rem] p-12 border border-white/5 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,1)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10 px-4">
            <div>
              <h3 className="text-5xl font-black italic mb-2 tracking-tighter text-white uppercase leading-none">Premium Selection</h3>
              <p className="text-gray-500 font-black text-sm uppercase italic tracking-widest">Luxury Villas & Private Transports</p>
            </div>
            <Link to="/booking" className="bg-red-600 hover:bg-red-700 px-10 py-5 rounded-2xl font-black text-xs text-white shadow-2xl shadow-red-900/40 active:scale-95 transition-all uppercase italic tracking-[0.2em]">
              Reserve Now
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10 px-4">
            {[
              { name: 'District 1 Penthouse', price: 'VND 3,500,000~', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800' },
              { name: 'Thao Dien Luxury Villa', price: 'VND 9,000,000~', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800' }
            ].map(item => (
              <div key={item.name} className="group relative aspect-video rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl cursor-pointer">
                <img src={item.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-50" alt={item.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                <div className="absolute bottom-10 left-10">
                  <span className="text-red-500 font-black text-[9px] uppercase mb-2 block tracking-[0.3em] italic">Vetted Residence</span>
                  <h4 className="text-3xl font-black mb-1 text-white group-hover:text-red-600 transition-colors tracking-tighter uppercase leading-none italic">{item.name}</h4>
                  <p className="text-lg font-black text-gray-400 italic tracking-tighter">{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
