import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { BRAND_NAME } from '../constants';
import type { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
}

const Header: React.FC<HeaderProps> = ({ currentUser }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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

  // 🔴 로그아웃 강화: 로컬 스토리지 비우기 추가
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear(); // 인증 토큰 및 찌꺼기 제거
      navigate('/');
      window.location.reload(); // 전체 상태 초기화
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 border-b ${
      isScrolled ? 'py-3 bg-black/90 backdrop-blur-md border-white/10 shadow-2xl' : 'py-6 bg-transparent border-transparent'
    }`}>
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-red-600 w-10 h-10 rounded-xl flex items-center justify-center group-hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95">
              <span className="text-white font-black italic text-2xl">H</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-white uppercase italic">{BRAND_NAME}</span>
          </Link>

          <nav className="hidden xl:flex items-center gap-8">
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                to={item.path} 
                className={`text-[13px] font-black transition-all hover:text-white uppercase italic tracking-wider ${
                  isActive(item.path) ? 'text-red-600 underline underline-offset-8 decoration-2' : 'text-gray-400'
                }`}
              >
                {item.name}
              </Link>
            ))}
            {/* 🔴 포인트 상점 연결 */}
            <Link to="/coupon-shop" className="text-[12px] font-black text-red-500 italic animate-pulse tracking-[0.2em] uppercase ml-4 bg-red-600/10 px-4 py-1.5 rounded-full border border-red-600/20">
              COUPON SHOP
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          {currentUser ? (
            <div className="flex items-center gap-6">
              <Link to="/mypage" className="flex items-center gap-4 group">
                <div className="flex flex-col items-end hidden md:flex">
                  {currentUser.role === 'ADMIN' && (
                    <span className="text-[9px] text-red-500 font-black tracking-widest uppercase italic mb-0.5">Administrator</span>
                  )}
                  <span className="text-sm font-black text-white group-hover:text-red-600 transition-colors italic tracking-tighter">
                    {currentUser.nickname}님
                  </span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-red-600 font-black italic text-xl shadow-xl group-hover:border-red-600/50 transition-all overflow-hidden">
                  {currentUser.avatar_url ? (
                    <img src={currentUser.avatar_url} alt="avt" className="w-full h-full object-cover" />
                  ) : (
                    currentUser.nickname?.[0].toUpperCase()
                  )}
                </div>
              </Link>
              <button 
                onClick={handleLogout} 
                className="px-6 py-2.5 text-[11px] font-black bg-white/5 hover:bg-red-600 hover:text-white border border-white/10 rounded-xl transition-all text-gray-400 uppercase italic shadow-lg shadow-black/40"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/signup" className="text-[12px] font-black text-gray-500 hover:text-white transition-colors uppercase italic tracking-widest">Join</Link>
              <Link to="/login" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-2xl text-[13px] font-black transition-all shadow-xl shadow-red-600/20 italic uppercase tracking-tighter active:scale-95">
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
