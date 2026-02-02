import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { BRAND_NAME } from '../constants';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { currentUser, loading: authLoading } = useAuth();

  const navItems = [
    { name: '마사지', path: '/stores/massage' },
    { name: '이발소', path: '/stores/barber' },
    { name: '가라오케', path: '/stores/karaoke' },
    { name: '바/클럽', path: '/stores/barclub' },
    { name: '숙소/풀빌라', path: '/stores/villa' },
    { name: '투어/차량', path: '/booking' },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 페이지 이동 시 메뉴 닫기 (스크롤 잠금 로직 없음)
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    setIsMenuOpen(false);
    navigate('/');
    window.location.reload();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 border-b ${
      isScrolled ? 'py-3 bg-black/95 backdrop-blur-md border-white/10' : 'py-6 bg-transparent border-transparent'
    }`}>
      <div className="max-w-[1500px] mx-auto px-6 flex items-center justify-between">

        {/* 로고 영역 (PC & 모바일 공통) */}
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2 group relative z-[110]">
            <div className="bg-red-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-xl shadow-red-600/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-black italic text-2xl">H</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-white uppercase italic">{BRAND_NAME}</span>
          </Link>

          {/* PC 네비게이션 */}
          <nav className="hidden xl:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-[14px] font-black transition-all hover:text-white uppercase italic tracking-tighter ${
                  isActive(item.path) ? 'text-red-600 underline underline-offset-8 decoration-2' : 'text-gray-200'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link to="/coupon-shop" className="text-[11px] font-black text-red-500 italic uppercase ml-4 bg-red-600/10 px-4 py-1.5 rounded-full border border-red-600/20 hover:bg-red-600 hover:text-white transition-all shadow-lg">
              COUPON SHOP
            </Link>
          </nav>
        </div>

        {/* PC 우측 버튼 구역 */}
        <div className="hidden xl:flex items-center gap-6">
          <div className="flex items-center gap-6 border-r border-white/10 pr-6 mr-2">
            <Link to="/danang" className="text-[13px] font-black text-blue-500 hover:text-blue-400 uppercase italic">다낭놀자</Link>
            <Link to="/nhatrang" className="text-[13px] font-black text-emerald-500 hover:text-emerald-400 uppercase italic">나트랑놀자</Link>
          </div>

          {!authLoading && (
            currentUser ? (
              <div className="flex items-center gap-6 animate-in fade-in duration-300">
                <Link to="/mypage" className="flex items-center gap-4 group">
                  <div className="flex flex-col items-end hidden md:flex">
                    {currentUser.role === 'ADMIN' && (
                      <span className="text-[9px] text-red-500 font-black tracking-widest uppercase italic mb-0.5">ADMINISTRATOR</span>
                    )}
                    <span className="text-sm font-black text-white italic tracking-tight">{currentUser.nickname}님</span>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-red-600 font-black shadow-2xl overflow-hidden relative">
                    {currentUser.avatar_url ? <img src={currentUser.avatar_url} className="w-full h-full object-cover" /> : <span className="text-xl">{currentUser.nickname?.[0].toUpperCase()}</span>}
                  </div>
                </Link>
                <button onClick={handleLogout} className="px-6 py-2.5 text-[11px] font-black bg-[#111] border border-white/10 rounded-xl text-gray-400 uppercase italic hover:bg-red-600 hover:text-white transition-all shadow-lg active:scale-95">로그아웃</button>
              </div>
            ) : (
              <div className="flex items-center gap-6 animate-in fade-in duration-300">
                <Link to="/signup" className="text-[13px] font-black text-gray-400 hover:text-white uppercase italic tracking-tighter">회원가입</Link>
                <Link to="/login" className="bg-red-600 text-white px-8 py-3 rounded-2xl text-[14px] font-black italic uppercase shadow-xl shadow-red-600/20 active:scale-95 transition-all">로그인</Link>
              </div>
            )
          )}
        </div>

        {/* 모바일 햄버거 버튼 */}
        <button onClick={toggleMenu} className="xl:hidden relative z-[110] w-10 h-10 flex flex-col items-end justify-center gap-1.5">
          <span className={`h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'w-8 rotate-45 translate-y-2' : 'w-8'}`}></span>
          <span className={`h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'w-8'}`}></span>
          <span className={`h-0.5 bg-red-600 transition-all duration-300 ${isMenuOpen ? 'w-8 -rotate-45 -translate-y-2' : 'w-5'}`}></span>
        </button>
      </div>

      {/* 모바일 사이드바 (본문 스크롤 연동 버전) */}
      <div className={`fixed inset-0 z-[105] xl:hidden transition-all duration-300 ${isMenuOpen ? 'visible' : 'invisible'}`}>
        {/* 배경 딤드 (본문 보임 & 스크롤 가능) */}
        <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={toggleMenu}></div>

        {/* 메뉴바 (우측 고정, 본문은 아래서 계속 스크롤됨) */}
        <div className={`absolute top-0 right-0 h-screen w-[65%] max-w-[280px] bg-[#0a0a0a] border-l border-white/5 shadow-2xl transition-transform duration-400 ease-in-out p-8 flex flex-col ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex flex-col gap-6 mt-24">
            {navItems.map((item) => (
              <Link key={item.name} to={item.path} className={`text-xl font-black italic uppercase tracking-tighter ${isActive(item.path) ? 'text-red-600' : 'text-gray-300'}`}>
                {item.name}
              </Link>
            ))}
            <Link to="/community" className={`text-xl font-black italic uppercase tracking-tighter ${isActive('/community') ? 'text-red-600' : 'text-gray-300'}`}>커뮤니티</Link>
            <Link to="/coupon-shop" className={`text-xl font-black italic uppercase tracking-tighter ${isActive('/coupon-shop') ? 'text-red-600' : 'text-gray-300'}`}>쿠폰샵</Link>
          </div>

          <div className="h-px bg-white/5 w-full my-8"></div>

          <div className="flex flex-col gap-3 mb-10">
            <Link to="/danang" className="text-sm font-black text-blue-500 italic uppercase">다낭놀자</Link>
            <Link to="/nhatrang" className="text-sm font-black text-emerald-500 italic uppercase">나트랑놀자</Link>
          </div>

          {/* 하단 로그인/회원가입 구역 (클릭 가능하도록 수정) */}
          <div className="mt-auto">
            {currentUser ? (
              <div className="space-y-4">
                <Link to="/mypage" className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-black italic text-white overflow-hidden shadow-lg text-sm">
                    {currentUser.avatar_url ? <img src={currentUser.avatar_url} className="w-full h-full object-cover" /> : currentUser.nickname?.[0]}
                  </div>
                  <span className="text-sm font-black text-white italic truncate">{currentUser.nickname}님</span>
                </Link>
                <button onClick={handleLogout} className="w-full py-3 bg-white/5 text-gray-600 font-black rounded-xl uppercase italic text-[10px] tracking-widest border border-white/5">로그아웃</button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link to="/login" className="block w-full py-4 bg-red-600 text-white text-center rounded-xl font-black text-sm italic shadow-lg">로그인</Link>
                <Link to="/signup" className="block w-full py-3 text-gray-500 text-center font-black text-[10px] italic uppercase tracking-widest">회원가입</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
