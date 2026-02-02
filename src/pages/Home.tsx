import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStores } from '../hooks/useStores';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { useFetchGuard } from '../hooks/useFetchGuard';
import StoreCard from '../components/StoreCard';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, initialized } = useAuth();
  const { stores, loading: storesLoading } = useStores('all');
  
  const [latestPosts, setLatestPosts] = useState<any[]>([]);
  const [latestNotices, setLatestNotices] = useState<any[]>([]);
  const [showLevelModal, setShowLevelModal] = useState(false);

  const hotStores = stores.filter(s => s.is_hot).slice(0, 5);
  const villaStores = stores.filter(s => s.category === 'villa').slice(0, 4);

  const fetchHomeData = async () => {
    try {
      const [postRes, noticeRes] = await Promise.all([
        supabase
          .from('posts')
          .select('*, author:profiles(nickname)')
          .neq('category', 'vip') // 🔴 VIP 글 제외 필터링
          .order('created_at', { ascending: false })
          .limit(6),
        supabase
          .from('notices')
          .select('*')
          .order('is_important', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(6)
      ]);

      if (postRes.data) setLatestPosts(postRes.data);
      if (noticeRes.data) setLatestNotices(noticeRes.data);
    } catch (err) {
      console.error('Home 데이터 동기화 에러:', err);
    }
  };

  useFetchGuard(fetchHomeData, []);

  const handleVIPClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUser || currentUser.level < 3) {
      setShowLevelModal(true);
    } else {
      navigate('/vip-lounge');
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#050505] relative overflow-hidden selection:bg-red-600/30">
      {showLevelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowLevelModal(false)}></div>
          <div className="relative bg-[#111] border border-yellow-600/30 p-8 rounded-[2rem] max-w-[340px] w-full text-center shadow-2xl animate-in zoom-in duration-200">
            <div className="w-14 h-14 bg-yellow-600/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-yellow-600/20">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-xl font-black text-white italic mb-2 uppercase tracking-tighter">VIP LOUNGE ONLY</h3>
            <p className="text-slate-400 text-sm font-bold mb-8">VIP 라운지는 베테랑(Lv.3) 이상만 입장 가능합니다.<br/>활동을 통해 등급을 올려주세요!</p>
            <button onClick={() => setShowLevelModal(false)} className="w-full py-4 bg-yellow-600 text-black rounded-xl font-black text-sm hover:bg-yellow-500 transition-all">확인</button>
          </div>
        </div>
      )}

      {/* [섹션 1] Hero */}
      <section className="relative pt-44 pb-24 px-6 flex flex-col items-center text-center">
        <h2 className="text-7xl md:text-9xl font-black italic tracking-tighter mb-8 leading-none text-white">
          호치민에서 <span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">놀자!</span>
        </h2>
        <div className="grid grid-cols-5 gap-4 max-w-5xl w-full z-10 px-4 mt-16">
          {[{ id: 'massage', name: '마사지/스파', icon: '💆‍♀️' }, { id: 'barber', name: '이발소', icon: '💈' }, { id: 'karaoke', name: '가라오케', icon: '🎤' }, { id: 'barclub', name: '바/클럽', icon: '🍸' }, { id: 'villa', name: '숙소/풀빌라', icon: '🏠' }].map((cat) => (
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
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          {storesLoading ? [1,2,3,4,5].map(i => <div key={i} className="aspect-[3/4] bg-white/5 rounded-[24px] animate-pulse" />) : hotStores.map(store => <StoreCard key={store.id} store={store} />)}
        </div>
      </section>

      {/* [섹션 3] 커뮤니티 & VIP & 공지사항 */}
      <section className="max-w-[1400px] mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-2 flex lg:flex-col gap-4">
          {/* 🔴 텔레그램 링크 업데이트 */}
          <a href="https://t.me/honolja" target="_blank" rel="noreferrer" className="flex-1 bg-[#0088cc] rounded-[2rem] p-8 relative overflow-hidden group hover:scale-[1.03] transition-all shadow-xl">
            <span className="text-[10px] font-black text-white/50 uppercase block mb-1">Telegram</span>
            <h4 className="text-xl font-black italic text-white leading-tight">그룹챗 입장</h4>
            <span className="absolute -bottom-4 -right-2 text-9xl font-black text-white/5 italic select-none">H</span>
          </a>
          {/* 🔴 카카오톡 링크 업데이트 */}
          <a href="https://open.kakao.com/o/gx4EsPRg" target="_blank" rel="noreferrer" className="flex-1 bg-[#FEE500] rounded-[2rem] p-8 relative overflow-hidden group hover:scale-[1.03] transition-all text-black shadow-xl">
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
                    <span className="text-[10px] text-gray-600 font-bold tracking-tighter">{post.author?.nickname || 'Guest'}</span>
                  </div>
                  <span className="text-red-800 text-[10px] font-black">+{post.likes || 0}</span>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-black italic text-lg border-l-4 border-yellow-500 pl-3 uppercase text-yellow-500">VIP 라운지</h4>
              <button onClick={handleVIPClick} className="text-[10px] text-gray-600 font-bold underline hover:text-white uppercase italic">Access</button>
            </div>
            <div className="bg-[#111] rounded-2xl border border-yellow-500/10 divide-y divide-white/5 overflow-hidden shadow-[0_0_20px_rgba(234,179,8,0.05)]">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} onClick={handleVIPClick} className="flex justify-between items-center p-4 hover:bg-yellow-500/5 cursor-pointer group">
                  <p className="text-sm font-bold group-hover:text-yellow-500 truncate mb-1 text-slate-200"><span className="text-yellow-600 mr-1.5">[VIP]</span> 기밀 정보 보호됨</p>
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
                  <p className={`text-sm font-bold truncate ${notice.is_important ? 'text-red-500' : 'text-slate-200'}`}>{notice.is_important && '[필독] '}{notice.title}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* [섹션 4] PREMIUM STAYS - 4열 배치 유지 */}
      <section className="max-w-[1400px] mx-auto px-6 py-24 mb-20">
        <div className="bg-[#080808] rounded-[3rem] p-12 border border-white/5 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10 px-4">
            <div>
              <h3 className="text-4xl font-black italic mb-2 tracking-tighter text-white uppercase leading-none">Premium Stays</h3>
              <p className="text-gray-500 font-bold text-sm md:text-base">호놀자가 검증한 최고급 풀빌라와 차량 서비스</p>
            </div>
            <Link to="/stores/villa" className="bg-red-600 hover:bg-red-700 px-10 py-4 rounded-2xl font-black text-sm text-white shadow-xl shadow-red-600/20 active:scale-95 transition-all">예약문의</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10 px-4">
            {storesLoading ? [1, 2, 3, 4].map(i => <div key={i} className="aspect-video bg-white/5 rounded-[1.5rem] animate-pulse" />) : villaStores.map(store => <StoreCard key={store.id} store={store} />)}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
