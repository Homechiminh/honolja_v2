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

  // 1. 메인 메뉴 (커뮤니티 제외)
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 border-b ${
      isScrolled ? 'py-3 bg-black/95 backdrop-blur-md border-white/10' : 'py-6 bg-transparent border-transparent'
    }`}>
      <div className="max-w-[1500px] mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-10">
          {/* 로고 섹션 */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-red-600 w-10 h-10 rounded-xl flex items-center justify-center">
              <span className="text-white font-black italic text-2xl">H</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-white uppercase italic">{BRAND_NAME}</span>
          </Link>

          {/* 중앙 네비게이션 */}
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
            <Link to="/coupon-shop" className="text-[11px] font-black text-red-500 italic uppercase ml-4 bg-red-600/10 px-4 py-1.5 rounded-full border border-red-600/20">
              COUPON SHOP
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          {/* 다낭(파랑) / 나트랑(초록) 메뉴 복구 */}
          <div className="hidden xl:flex items-center gap-6">
            <Link to="/danang" className="text-[13px] font-black text-blue-500 hover:text-blue-400 uppercase italic">다낭놀자</Link>
            <Link to="/nhatrang" className="text-[13px] font-black text-emerald-500 hover:text-emerald-400 uppercase italic">나트랑놀자</Link>
          </div>

          {/* 회원 섹션: 로그인 유무에 따라 변경 */}
          {currentUser ? (
            <div className="flex items-center gap-6">
              <Link to="/mypage" className="flex items-center gap-4 group">
                <div className="flex flex-col items-end hidden md:flex">
                  {currentUser.role === 'ADMIN' && (
                    <span className="text-[9px] text-red-500 font-black tracking-widest uppercase italic mb-0.5">ADMINISTRATOR</span>
                  )}
                  <span className="text-sm font-black text-white italic">{currentUser.nickname}님</span>
                </div>
                {/* 🔴 프로필 이미지(아바타) 복구 */}
                <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-red-600 font-black italic shadow-xl group-hover:border-red-600/50 transition-all overflow-hidden">
                  {currentUser.avatar_url ? (
                    <img src={currentUser.avatar_url} alt="avt" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">{currentUser.nickname?.[0].toUpperCase()}</span>
                  )}
                </div>
              </Link>
              <button 
                onClick={handleLogout} 
                className="px-6 py-2.5 text-[11px] font-black bg-[#111] border border-white/10 rounded-xl text-gray-400 uppercase italic hover:bg-red-600 hover:text-white transition-all shadow-lg"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              {/* 비로그인 상태: 한글 UI */}
              <Link to="/signup" className="text-[13px] font-black text-gray-400 hover:text-white uppercase italic">회원가입</Link>
              <Link to="/login" className="bg-red-600 text-white px-8 py-3 rounded-2xl text-[14px] font-black italic uppercase shadow-xl shadow-red-600/20 active:scale-95 transition-all">
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
