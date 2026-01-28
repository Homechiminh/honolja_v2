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

  // 🔴 한글 메뉴 명칭 및 다낭/나트랑 경로 복구
  const navItems = [
    { name: '마사지', path: '/stores/massage' },
    { name: '이발소', path: '/stores/barber' },
    { name: '가라오케', path: '/stores/karaoke' },
    { name: '바/클럽', path: '/stores/barclub' },
    { name: '숙소/풀빌라', path: '/stores/villa' },
    { name: '다낭놀자', path: '/danang' }, // 복구됨
    { name: '나트랑놀자', path: '/nhatrang' }, // 복구됨
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
      isScrolled ? 'py-3 bg-black/90 backdrop-blur-md border-white/10 shadow-2xl' : 'py-6 bg-transparent border-transparent'
    }`}>
      <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* 로고: 이미지와 동일하게 Red H + 한글 텍스트 */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-red-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20 active:scale-95">
              <span className="text-white font-black italic text-2xl">H</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-white uppercase italic">{BRAND_NAME}</span>
          </Link>

          {/* 메인 네비게이션: 한글화 및 촘촘한 간격 */}
          <nav className="hidden 2xl:flex items-center gap-6">
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                to={item.path} 
                className={`text-[13px] font-black transition-all hover:text-white uppercase italic tracking-tighter ${
                  isActive(item.path) ? 'text-red-600 underline underline-offset-8' : 'text-gray-400'
                }`}
              >
                {item.name}
              </Link>
            ))}
            {/* 🔴 COUPON SHOP: 빨간 테두리 캡슐 디자인 */}
            <Link to="/coupon-shop" className="text-[11px] font-black text-red-500 italic tracking-[0.15em] uppercase ml-2 bg-red-600/5 px-4 py-1.5 rounded-full border border-red-600/30 hover:bg-red-600 hover:text-white transition-all">
              COUPON SHOP
            </Link>
          </nav>
        </div>

        {/* 우측 로그인/로그아웃 섹션 */}
        <div className="flex items-center gap-6">
          {currentUser ? (
            <div className="flex items-center gap-5">
              <Link to="/mypage" className="flex items-center gap-3 group">
                <div className="flex flex-col items-end hidden md:flex">
                  {currentUser.role === 'ADMIN' && (
                    <span className="text-[8px] text-red-500 font-black tracking-widest uppercase italic mb-0.5">ADMINISTRATOR</span>
                  )}
                  <span className="text-[13px] font-black text-white group-hover:text-red-600 transition-colors italic tracking-tighter">
                    {currentUser.nickname}님
                  </span>
                </div>
                {/* 아바타: 이미지와 동일한 둥근 사각 테두리 */}
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-red-600 font-black italic shadow-xl group-hover:border-red-600/50 transition-all overflow-hidden">
                  {currentUser.avatar_url ? (
                    <img src={currentUser.avatar_url} alt="avt" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg">{currentUser.nickname?.[0].toUpperCase()}</span>
                  )}
                </div>
              </Link>
              {/* 로그아웃 버튼: 이미지의 어두운 박스 디자인 */}
              <button 
                onClick={handleLogout} 
                className="px-5 py-2 text-[10px] font-black bg-[#111] hover:bg-red-600 hover:text-white border border-white/10 rounded-xl transition-all text-gray-400 uppercase italic shadow-2xl"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              {/* JOIN 텍스트 링크 및 LOGIN 빨간 버튼 */}
              <Link to="/signup" className="text-[11px] font-black text-gray-500 hover:text-white transition-colors uppercase italic tracking-widest">JOIN</Link>
              <Link to="/login" className="bg-red-600 hover:bg-red-700 text-white px-7 py-2.5 rounded-xl text-[12px] font-black transition-all shadow-xl shadow-red-600/20 italic uppercase tracking-tighter active:scale-95">
                LOGIN
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
