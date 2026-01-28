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

  // 1. 중앙 서비스 메뉴 (가독성 개선)
  const serviceItems = [
    { name: '마사지', path: '/stores/massage' },
    { name: '이발소', path: '/stores/barber' },
    { name: '가라오케', path: '/stores/karaoke' },
    { name: '바/클럽', path: '/stores/barclub' },
    { name: '숙소/풀빌라', path: '/stores/villa' },
    { name: '투어/차량', path: '/booking' },
    { name: '커뮤니티', path: '/community' },
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
      isScrolled ? 'py-3 bg-black/95 backdrop-blur-md border-white/10 shadow-2xl' : 'py-6 bg-transparent border-transparent'
    }`}>
      <div className="max-w-[1800px] mx-auto px-8 flex items-center justify-between">
        
        {/* [좌측] 로고 및 메인 서비스 */}
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-red-600 w-11 h-11 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30">
              <span className="text-white font-black italic text-2xl">H</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-white uppercase italic">{BRAND_NAME}</span>
          </Link>

          <nav className="hidden 2xl:flex items-center gap-8">
            {serviceItems.map((item) => (
              <Link 
                key={item.name} 
                to={item.path} 
                className={`text-[15px] font-black transition-all uppercase italic tracking-tighter ${
                  isActive(item.path) 
                  ? 'text-red-600 underline underline-offset-8 decoration-2' 
                  : 'text-gray-100 hover:text-white' // 가독성을 위해 text-gray-100으로 상향
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link to="/coupon-shop" className="text-[12px] font-black text-red-500 italic tracking-[0.2em] uppercase ml-2 bg-red-600/5 px-5 py-2 rounded-full border border-red-600/40 hover:bg-red-600 hover:text-white transition-all">
              COUPON SHOP
            </Link>
          </nav>
        </div>

        {/* [우측] 지역특화 메뉴 + 회원 섹션 */}
        <div className="flex items-center gap-10">
          
          <div className="hidden xl:flex items-center gap-8">
            {/* 다낭놀자: 파란색 테마 */}
            <Link 
              to="/danang" 
              className="text-[14px] font-black text-blue-400 hover:text-blue-300 uppercase italic tracking-tighter transition-colors"
            >
              다낭놀자
            </Link>
            {/* 나트랑놀자: 초록색 테마 */}
            <Link 
              to="/nhatrang" 
              className="text-[14px] font-black text-emerald-400 hover:text-emerald-300 uppercase italic tracking-tighter transition-colors"
            >
              나트랑놀자
            </Link>
          </div>

          <div className="flex items-center gap-6">
            {currentUser ? (
              <div className="flex items-center gap-6">
                <Link to="/mypage" className="flex flex-col items-end group">
                  <span className="text-[13px] font-black text-white group-hover:text-red-500 italic transition-colors">
                    {currentUser.nickname}님
                  </span>
                  <span className="text-[9px] text-gray-500 font-bold uppercase italic tracking-widest">My Intelligence</span>
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="px-5 py-2 text-[11px] font-black bg-[#111] border border-white/10 rounded-xl text-gray-400 uppercase italic hover:bg-red-600 hover:text-white transition-all"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-8">
                {/* 한글 회원가입 */}
                <Link to="/signup" className="text-[13px] font-black text-gray-300 hover:text-white uppercase italic tracking-widest transition-colors">
                  회원가입
                </Link>
                {/* 한글 로그인 버튼 */}
                <Link to="/login" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-2xl text-[14px] font-black transition-all shadow-xl shadow-red-600/30 italic uppercase tracking-tighter active:scale-95">
                  로그인
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
