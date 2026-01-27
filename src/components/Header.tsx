import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { BRAND_NAME } from '../constants';
import type { User } from '../types'; //

// App.tsx에서 전달하는 currentUser 타입을 정의합니다.
interface HeaderProps {
  currentUser: User | null;
}

const Header: React.FC<HeaderProps> = ({ currentUser }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // 기존 navItems 데이터 유지
  const navItems = [
    { name: '마사지', path: '/stores/massage' },
    { name: '이발소', path: '/stores/barber' },
    { name: '가라오케', path: '/stores/karaoke' },
    { name: '클럽', path: '/stores/barclub' },
    { name: '숙소/풀빌라', path: '/stores/villa' },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 로그아웃 로직
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 border-b ${
        isScrolled 
          ? 'py-3 bg-black/90 backdrop-blur-md border-white/10' 
          : 'py-6 bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
        
        {/* 1. 좌측 로고 및 메뉴 */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-red-600 w-9 h-9 rounded-xl flex items-center justify-center group-hover:bg-red-700 transition-colors shadow-lg">
              <span className="text-white font-black italic text-xl">H</span>
            </div>
            <span className="text-xl font-black tracking-tighter text-white uppercase italic">{BRAND_NAME}</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                to={item.path}
                className={`text-[14px] font-bold transition-all hover:text-white ${
                  isActive(item.path) ? 'text-red-500' : 'text-gray-400'
                }`}
              >
                {item.name}
              </Link>
            ))}
            {/* 기존의 포인트 컬러 메뉴 유지 */}
            <span className="text-[13px] font-black text-red-500 italic animate-pulse cursor-default tracking-widest">COUPON SHOP</span>
          </nav>
        </div>

        {/* 2. 우측 버튼 섹션 (기존 놀자 시리즈 버튼 포함) */}
        <div className="flex items-center gap-4">
          {/* 다낭/나트랑 바로가기 버튼 유지 */}
          <div className="hidden xl:flex items-center gap-2 mr-4">
            <button className="px-3 py-1.5 rounded-lg border border-blue-900/50 bg-blue-900/10 text-[11px] font-black text-blue-400 hover:bg-blue-900/20 transition-all">
              다낭놀자
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-green-900/50 bg-green-900/10 text-[11px] font-black text-green-400 hover:bg-green-900/20 transition-all">
              나트랑놀자
            </button>
          </div>

          {currentUser ? (
            // 로그인 상태 UI
            <div className="flex items-center gap-5">
              <Link to="/mypage" className="flex items-center gap-3 group">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-[9px] text-gray-500 font-black tracking-[0.2em] uppercase">Member</span>
                  <span className="text-sm font-black text-white group-hover:text-red-500 transition-colors">
                    {currentUser.nickname}님
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-red-500 font-black italic shadow-xl group-hover:border-red-600 transition-all">
                  {currentUser.nickname[0].toUpperCase()}
                </div>
              </Link>
              <button 
                onClick={handleLogout}
                className="px-5 py-2 text-[11px] font-black bg-white/5 hover:bg-red-600 hover:text-white border border-white/10 rounded-full transition-all text-gray-400"
              >
                로그아웃
              </button>
            </div>
          ) : (
            // 비로그인 상태 UI
            <div className="flex items-center gap-3">
              <Link 
                to="/signup" 
                className="text-[13px] font-bold text-gray-300 hover:text-white px-3 py-2 transition-colors"
              >
                회원가입
              </Link>
              <Link 
                to="/login" 
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl text-[13px] font-black transition-all active:scale-95 shadow-lg shadow-red-600/20 italic"
              >
                로그인
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
