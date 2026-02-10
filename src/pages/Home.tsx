import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useStores } from '../hooks/useStores';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import StoreCard from '../components/StoreCard';
// 지도 연동을 위한 라이브러리 추가
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, initialized, refreshUser } = useAuth();
  const { stores, loading: storesLoading } = useStores('all');
  
  const [latestPosts, setLatestPosts] = useState<any[]>([]);
  const [latestVipPosts, setLatestVipPosts] = useState<any[]>([]);
  const [latestNotices, setLatestNotices] = useState<any[]>([]);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [currentAdIdx, setCurrentAdIdx] = useState(0);

  // 🗺️ 지도 관련 상태 및 로더
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  });

  // 🔴 [자동 출석 시스템] 1일 1회 5P 지급
  useEffect(() => {
    const checkAttendance = async () => {
      if (!initialized || !currentUser) return;

      const today = new Date().toLocaleDateString('en-CA'); 
      
      try {
        const { data: existing, error: fetchError } = await supabase
          .from('attendance')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('check_in_date', today)
          .maybeSingle();

        if (!existing && !fetchError) {
          const { error: insertError } = await supabase
            .from('attendance')
            .insert([{ user_id: currentUser.id, check_in_date: today }]);

          if (!insertError) {
            const rewardPoints = 5; 
            await supabase
              .from('profiles')
              .update({ points: (currentUser.points || 0) + rewardPoints })
              .eq('id', currentUser.id);

            await supabase.from('point_history').insert([{
              user_id: currentUser.id,
              amount: rewardPoints,
              reason: '일일 자동 출석 보상 (5P)'
            }]);

            await refreshUser();
            alert(`✨ 반가워요! 오늘의 출석 보상 ${rewardPoints}P가 지급되었습니다.`);
          }
        }
      } catch (err) {
        console.error('Attendance Check Error:', err);
      }
    };

    checkAttendance();
  }, [initialized, currentUser, refreshUser]);

  // 🔥 [인기 업소 로직] HOT 업소 중 최대 14개를 무작위로 추출
  const hotServiceStores = useMemo(() => {
    return stores
      .filter((s: any) => s.is_hot && s.category !== 'villa')
      .sort(() => Math.random() - 0.5)
      .slice(0, 14);
  }, [stores]);

  // 📍 [지도용 좌표 데이터 추출] - any 처리로 TS 에러 방지
  const mapStores = useMemo(() => {
    return stores.filter((s: any) => s.lat && s.lng);
  }, [stores]);

  const premiumHotStays = useMemo(() => {
    return stores.filter((s: any) => s.category === 'villa' && s.is_hot).slice(0, 2);
  }, [stores]);

  // 상단 배너 타이머
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAdIdx((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // 커뮤니티 데이터 페칭
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
    if (initialized) fetchHomeData();
  }, [initialized]);

  const handleVIPClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUser || currentUser.level < 3) {
      setShowLevelModal(true);
    } else {
      navigate('/vip-lounge');
    }
  };

  const handleVipPostClick = (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    if (!currentUser || currentUser.level < 3) {
      setShowLevelModal(true);
    } else {
      navigate(`/post/${postId}`);
    }
  };

  if (!initialized) return null;

  return (
    <div className="w-full bg-[#050505] relative overflow-hidden selection:bg-red-600/30 font-sans text-white">
      <Helmet>
        <title>호놀자 | 베트남 호치민 유흥 · 밤문화 · 마사지 · 가라오케 · 맛집 프리미엄 가이드</title>
        <meta name="description" content="베트남 호치민 여행의 모든 것! 마사지, 가라오케, 이발소, 클럽, 맛집 정보와 실시간 후기를 제공하는 호치민 No.1 커뮤니티 호놀자입니다." />
        <meta name="keywords" content="호치민여행, 호치민 유흥, 호치민 밤문화, 베트남여행, 호치민 가라오케, 호치민 마사지, 호치민 이발소, 호치민 맛집" />
        <meta property="og:title" content="호놀자 - 호치민 밤문화 & 여행 프리미엄 가이드" />
        <meta property="og:url" content="https://honolja.com" />
        <meta property="og:type" content="website" />
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
          <span className="text-[#FF0000] brightness-125 saturate-200 drop-shadow-[0_0_20px_rgba(255,0,0,0.4)]">호</span>치민에서 <span className="text-[#FF0000] brightness-125 saturate-200 drop-shadow-[0_0_20px_rgba(255,0,0,0.4)] tracking-tighter">놀자<span className="ml-5 md:ml-3">!</span></span>
        </h2>
        <div className="space-y-4 mb-16 z-10 px-4 flex flex-col items-center">
          <p className="text-[17px] sm:text-2xl md:text-4xl font-black tracking-tight uppercase whitespace-nowrap leading-tight">남성들을 위한 호치민의 모든 것</p>
          <p className="text-blue-500 font-black text-lg md:text-2xl italic leading-snug">실시간 정보 + 검증된 업장 + 그 이상의 즐거움(α)</p>
          <p className="text-emerald-400 font-bold text-sm md:text-lg opacity-90 mt-2 italic">풀빌라 · 아파트 예약까지 한번에!</p>
        </div>

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
            [...Array(14)].map((_, i) => <div key={i} className="aspect-[3/4] bg-white/5 rounded-[24px] animate-pulse" />) : 
            hotServiceStores.map((store: any) => <StoreCard key={store.id} store={store} />)
          }
        </div>
      </section>

      {/* 🗺️ 내 주변 방앗간 찾기 (지도 섹션) */}
      <section className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="bg-[#111] rounded-[3rem] p-8 md:p-12 border border-white/5 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
            <h3 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter">
              내 주변 <span className="text-emerald-500">방앗간</span> 찾기
            </h3>
          </div>
          
          <div className="w-full h-[500px] md:h-[650px] rounded-[2rem] overflow-hidden border-4 border-white/5 shadow-inner relative">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={{ lat: 10.7769, lng: 106.7009 }} 
                zoom={14}
                options={{
                  // 🚨 지도가 어둡게 나오는 문제 해결을 위한 mapId 추가
                  mapId: "69a6320a10996f9", 
                  styles: [
                    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] }
                  ],
                }}
              >
                {/* 📍 마커 렌더링 수정 완료 */}
                {mapStores.map((store: any) => (
                  <MarkerF
                    key={store.id}
                    position={{ lat: Number(store.lat), lng: Number(store.lng) }}
                    onClick={() => setSelectedStore(store)}
                  />
                ))}

                {selectedStore && (
                  <InfoWindowF
                    position={{ lat: Number(selectedStore.lat), lng: Number(selectedStore.lng) }}
                    onCloseClick={() => setSelectedStore(null)}
                  >
                    <div className="p-2 min-w-[200px] text-black">
                      <img src={selectedStore.image_url} className="w-full h-24 object-cover rounded-lg mb-2" alt="" />
                      <h4 className="font-black text-sm mb-1">{selectedStore.name}</h4>
                      <p className="text-[10px] text-gray-600 mb-2">{selectedStore.address}</p>
                      <button 
                        onClick={() => navigate(`/store/${selectedStore.id}`)}
                        className="w-full py-2 bg-red-600 text-white text-[10px] font-black rounded uppercase"
                      >
                        방앗간 방문하기
                      </button>
                    </div>
                  </InfoWindowF>
                )}
              </GoogleMap>
            ) : (
              <div className="w-full h-full bg-white/5 animate-pulse flex items-center justify-center text-gray-500 font-black">MAP LOADING...</div>
            )}
          </div>
        </div>
      </section>

      {/* SNS & 커뮤니티 통합 섹션 */}
      <section className="max-w-[1400px] mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 font-sans text-white">
        <div className="lg:col-span-2 flex flex-row lg:flex-col gap-4">
          <a href="https://t.me/honolja" target="_blank" rel="noreferrer" className="flex-1 bg-[#0088cc] rounded-[1.5rem] p-6 relative overflow-hidden group hover:scale-[1.03] transition-all shadow-xl flex flex-col justify-center min-h-[140px]">
            <span className="absolute -right-4 -bottom-8 text-white/10 text-9xl font-black italic select-none">H</span>
            <span className="text-[8px] md:text-[10px] font-black text-white/60 uppercase block mb-1 relative z-10 italic">Channel</span>
            <h4 className="text-sm md:text-xl font-black italic text-white tracking-tighter relative z-10 leading-tight">호놀자 텔레그램</h4>
          </a>
          <a href="https://open.kakao.com/o/gx4EsPRg" target="_blank" rel="noreferrer" className="flex-1 bg-[#FEE500] rounded-[1.5rem] p-6 relative overflow-hidden group hover:scale-[1.03] transition-all text-black shadow-xl flex flex-col justify-center min-h-[140px]">
            <span className="absolute -right-4 -bottom-8 text-black/5 text-9xl font-black italic select-none">H</span>
            <span className="text-[8px] md:text-[10px] font-black text-black/40 uppercase block mb-1 relative z-10 italic">Open Chat</span>
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
              {latestPosts.map(post => (
                <Link key={post.id} to={`/post/${post.id}`} className="flex justify-between items-center p-4 hover:bg-white/5 transition-all group">
                  <div className="min-w-0 pr-4"><p className="text-sm font-bold group-hover:text-red-500 truncate text-slate-200">{post.title}</p></div>
                  <span className="text-red-600 text-[10px] font-black">+{post.likes || 0}</span>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-black italic text-lg border-l-4 border-yellow-500 pl-3 uppercase text-yellow-500">VIP 라운지</h4>
              <button onClick={handleVIPClick} className="text-[10px] text-gray-300 font-bold underline hover:text-white uppercase italic">더보기</button>
            </div>
            <div className="bg-[#111] rounded-2xl border border-yellow-500/10 divide-y divide-white/5 overflow-hidden shadow-2xl">
              {latestVipPosts.map(post => (
                <div key={post.id} onClick={(e) => handleVipPostClick(e, post.id)} className="flex justify-between items-center p-4 hover:bg-yellow-500/5 transition-all cursor-pointer group">
                  <div className="min-w-0 pr-4"><p className="text-sm font-bold group-hover:text-yellow-500 truncate text-slate-200">{post.title}</p></div>
                  <span className="text-[9px] font-black text-yellow-600 bg-yellow-600/10 px-1.5 py-0.5 rounded italic uppercase">VIP</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-black italic text-lg border-l-4 border-sky-500 pl-3 uppercase text-sky-500">Notice</h4>
              <Link to="/notice" className="text-[10px] text-gray-300 font-bold underline hover:text-white uppercase italic">더보기</Link>
            </div>
            <div className="space-y-3">
              {latestNotices.map(notice => (
                <Link key={notice.id} to={`/notice/${notice.id}`} className="block bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all shadow-xl">
                  <p className={`text-sm font-bold truncate ${notice.is_important ? 'text-red-500' : 'text-slate-200'}`}>
                    {notice.is_important && '[필독] '}{notice.title}
                  </p>
                </Link>
              ))}
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
            {storesLoading ? [1, 2].map(i => <div key={i} className="h-[250px] bg-white/5 rounded-[2.5rem] animate-pulse" />) : 
              premiumHotStays.map((store: any) => (
                <Link to={`/store/${store.id}`} key={store.id} className="group relative block w-full h-[250px] md:h-[350px] overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl transition-all">
                  <img src={store.image_url} alt={store.name} className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute top-6 left-6 flex gap-2">
                    <span className="bg-red-600 text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase italic shadow-lg">Hot Pick</span>
                  </div>
                  <div className="absolute bottom-8 left-8 right-8">
                    <h4 className="text-2xl md:text-4xl font-black text-white italic uppercase tracking-tighter mb-2 group-hover:text-red-500 transition-colors">{store.name}</h4>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">Ho Chi Minh Villa</span>
                  </div>
                </Link>
              ))
            }
          </div>
        </div>
      </section>

      {/* 하단 제휴 배너 */}
      <section className="max-w-[1400px] mx-auto px-6 pb-24 font-sans">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#111] h-[200px] md:h-[260px] shadow-2xl">
          <div className="flex h-full transition-transform duration-1000 ease-in-out" style={{ transform: `translateX(-${currentAdIdx * 100}%)` }}>
            <div className="min-w-full h-full flex flex-col justify-center items-center text-center p-6 md:p-10 text-white">
              <span className="text-red-600 font-black text-[10px] uppercase tracking-[0.3em] mb-4 italic">Partnership</span>
              <h4 className="text-white text-xl md:text-4xl font-black italic tracking-tighter leading-tight">호놀자와 함께하실 <br/> 광고주분들의 연락을 기다립니다.</h4>
            </div>
            <a href="https://t.me/honolja84" target="_blank" rel="noreferrer" className="min-w-full h-full flex flex-col justify-center items-center text-center p-6 md:p-10 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] text-white">
              <span className="text-blue-500 font-black text-[10px] uppercase tracking-[0.3em] mb-4 italic">Telegram Ad Contact</span>
              <h4 className="text-white text-lg md:text-4xl font-black italic tracking-tighter mb-6">호놀자 광고제휴 텔레그램 <span className="text-blue-400">@honolja84</span></h4>
              <div className="px-8 py-3 bg-blue-600/10 border border-blue-600/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-widest italic hover:bg-blue-600 hover:text-white transition-all">Contact Now</div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
