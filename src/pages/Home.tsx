import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStores } from '../hooks/useStores';
import { SNS_LINKS, BRAND_NAME } from '../constants';
import StoreCard from '../components/StoreCard';

const Home: React.FC = () => {
  // 1. 실시간 데이터 낚아오기 (전체 카테고리 로드)
  const { stores, loading } = useStores('all');
  const [showLevelModal, setShowLevelModal] = useState(false);

  // 2. 인기업소(HOT) 필터링 (최대 5개)
  const hotStores = stores.filter(s => s.is_hot).slice(0, 5);

  // 3. 베테랑 등급 가드 로직 (기존 로직 유지)
  const checkHideStatus = () => {
    const hiddenUntil = localStorage.getItem('hideVeteranNoticeUntil');
    return hiddenUntil && new Date().getTime() < parseInt(hiddenUntil);
  };

  const handleVeteranClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!checkHideStatus()) setShowLevelModal(true);
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
            <p className="text-slate-400 text-sm font-bold mb-8">베테랑(Lv.3) 회원 전용 정보입니다.<br/>활동을 통해 등급을 올려주세요!</p>
            <div className="space-y-4">
              <button onClick={() => setShowLevelModal(false)} className="w-full py-4 bg-yellow-600 text-black rounded-xl font-black text-sm hover:bg-yellow-500 transition-all">확인</button>
              <button onClick={hideForAWeek} className="text-xs text-slate-600 hover:text-slate-400 underline font-bold">일주일 동안 보지 않기</button>
            </div>
          </div>
        </div>
      )}

      {/* [섹션 1] Hero - 브랜드 메인 */}
      <section className="relative pt-44 pb-24 px-6 flex flex-col items-center text-center">
        <h2 className="text-7xl md:text-9xl font-black italic tracking-tighter mb-8 leading-none">
          호치민에서 <span className="text-glow-red">놀자!</span>
        </h2>
        <div className="space-y-4 mb-16 z-10">
          <p className="text-2xl md:text-4xl font-black tracking-tight text-white uppercase drop-shadow-md">남성들을 위한 호치민의 모든 것</p>
          <div className="space-y-1">
            <p className="text-blue-500 font-black text-lg md:text-2xl">실시간 정보 + 검증된 업장 + 그 이상의 즐거움(α)</p>
            <p className="text-cyan-400 font-bold text-sm md:text-lg opacity-90">풀빌라 · 아파트 예약까지 {BRAND_NAME}에서 한번에 !</p>
          </div>
        </div>

        {/* 카테고리 메뉴 - Link 연결 */}
        <div className="grid grid-cols-5 gap-4 max-w-5xl w-full z-10 px-4">
          {[
            { id: 'massage', name: '마사지/스파', icon: '💆‍♀️' },
            { id: 'barber', name: '이발소', icon: '💈' },
            { id: 'karaoke', name: '가라오케', icon: '🎤' },
            { id: 'barclub', name: '바/클럽', icon: '🍸' },
            { id: 'villa', name: '숙소/차량', icon: '🏠' },
          ].map((cat) => (
            <Link key={cat.id} to={`/stores/${cat.id}`} className="flex flex-col items-center gap-4 p-6 md:p-10 bg-white/5 backdrop-blur-sm rounded-[32px] border border-white/5 hover:bg-white/10 hover:border-red-600/30 transition-all group">
              <span className="text-3xl md:text-5xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-[10px] md:text-sm font-black text-gray-400 group-hover:text-white uppercase tracking-tighter">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* [섹션 2] HOT 실시간 인기 업소 */}
      <section className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-12">
          <h3 className="text-3xl font-black italic flex items-center gap-3">
            <span className="w-1.5 h-8 bg-red-600 rounded-full"></span>
            HOT 실시간 인기 업소
          </h3>
          <Link to="/stores/all" className="text-gray-500 font-bold text-sm hover:text-white underline">전체보기</Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
            {[1,2,3,4,5].map(i => <div key={i} className="aspect-[3/4] bg-white/5 rounded-[24px] animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
            {hotStores.map(store => <StoreCard key={store.id} store={store} />)}
          </div>
        )}
      </section>

      {/* [섹션 3] 커뮤니티 & SNS 피드 */}
      <section className="max-w-[1400px] mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* 좌측 SNS 배너 */}
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

        {/* 게시판 리스트들 */}
        <div className="lg:col-span-10 grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* 커뮤니티 피드 */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-black italic text-lg border-l-4 border-red-600 pl-3 uppercase">Community</h4>
              <Link to="/community" className="text-[10px] text-gray-600 font-bold underline hover:text-white transition-colors">더보기</Link>
            </div>
            <div className="bg-[#111] rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex justify-between items-center p-4 hover:bg-white/5 transition-all group cursor-pointer">
                  <div className="min-w-0 pr-4">
                    <p className="text-sm font-bold group-hover:text-red-500 truncate mb-1 text-slate-200">데이터 연동 준비 중...</p>
                    <span className="text-[10px] text-gray-600 font-bold tracking-tighter">호놀자부동산 · 10분 전</span>
                  </div>
                  <span className="text-red-800 text-[10px] font-black">+82</span>
                </div>
              ))}
            </div>
          </div>

          {/* 베테랑 게시판 */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-black italic text-lg border-l-4 border-yellow-500 pl-3 uppercase text-yellow-500">Veteran</h4>
              <button onClick={handleVeteranClick} className="text-[10px] text-gray-600 font-bold underline hover:text-white transition-colors">더보기</button>
            </div>
            <div className="bg-[#111] rounded-2xl border border-yellow-500/10 divide-y divide-white/5 overflow-hidden shadow-[0_0_20px_rgba(234,179,8,0.05)]">
              {[1, 2, 3, 4].map(i => (
                <div key={i} onClick={handleVeteranClick} className="flex justify-between items-center p-4 hover:bg-yellow-500/5 transition-all cursor-pointer group">
                  <div className="min-w-0 pr-4">
                    <p className="text-sm font-bold group-hover:text-yellow-500 truncate mb-1 text-slate-200"><span className="text-yellow-600 mr-1.5">[베테랑]</span> 정보 보호됨</p>
                    <span className="text-[10px] text-gray-600 font-bold tracking-tighter">비공개 · 방금 전</span>
                  </div>
                  <span className="text-[9px] font-black text-yellow-600 bg-yellow-600/10 px-1.5 py-0.5 rounded italic uppercase">Intel</span>
                </div>
              ))}
            </div>
          </div>

          {/* 공지사항 */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-black italic text-lg border-l-4 border-blue-500 pl-3 uppercase text-sky-500">Notice</h4>
              <Link to="/notice" className="text-[10px] text-gray-600 font-bold underline hover:text-white transition-colors">더보기</Link>
            </div>
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
                  <p className="text-sm font-bold text-red-500 mb-2 truncate">[필독] 커뮤니티 이용 규칙 안내 (필...)</p>
                  <div className="flex justify-between text-[10px] text-gray-600 font-bold">
                    <span>2024.03.10</span>
                    <span>조회 5400</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* [섹션 4] PREMIUM STAYS */}
      <section className="max-w-[1400px] mx-auto px-6 py-24 mb-20">
        <div className="bg-[#080808] rounded-[3rem] p-12 border border-white/5 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10 px-4">
            <div>
              <h3 className="text-4xl font-black italic mb-2 tracking-tighter text-white uppercase leading-none">Premium Stays</h3>
              <p className="text-gray-500 font-bold text-sm md:text-base">호놀자가 검증한 최고급 풀빌라와 차량 서비스</p>
            </div>
            <Link to="/booking" className="bg-red-600 hover:bg-red-700 px-10 py-4 rounded-2xl font-black text-sm text-white shadow-xl shadow-red-600/20 active:scale-95 transition-all">
              예약문의
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10 px-4">
            {[
              { name: '1군 럭셔리 펜트하우스', price: '150,000원~', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800' },
              { name: '타오디엔 풀빌라', price: '400,000원~', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800' }
            ].map(item => (
              <div key={item.name} className="group relative aspect-video rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl cursor-pointer">
                <img src={item.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-60" alt={item.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                <div className="absolute bottom-10 left-10">
                  <span className="text-red-500 font-black text-[10px] uppercase mb-2 block tracking-[0.2em]">Premium Selection</span>
                  <h4 className="text-3xl font-black mb-1 text-white group-hover:text-red-600 transition-colors tracking-tighter uppercase leading-none">{item.name}</h4>
                  <p className="text-xl font-bold text-gray-400 italic">{item.price}</p>
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
