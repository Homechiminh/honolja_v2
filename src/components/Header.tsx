import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  const navItems = [
    { name: '마사지', href: '#' },
    { name: '이발소', href: '#' },
    { name: '가라오케', href: '#' },
    { name: '커뮤니티', href: '#' },
    { name: '바/클럽', href: '#' },
  ];

  const openAuth = (view: 'login' | 'signup') => {
    setAuthView(view);
    setIsAuthOpen(true);
  };

  return (
    <>
      <header className="fixed top-0 z-50 w-full bg-black/90 backdrop-blur-md border-b border-white/10 px-6 py-3">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          
          {/* 1. 좌측 로고 및 메뉴 */}
          <div className="flex items-center gap-8">
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => window.location.href = '/'}
            >
              <div className="bg-red-600 w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-red-700 transition-colors">
                <span className="text-white font-black italic text-xl">H</span>
              </div>
              <span className="text-xl font-black tracking-tighter text-white">호놀자</span>
            </div>

            {/* 메인 메뉴 영역 (수정 완료: nav 태그 짝을 맞췄습니다) */}
            <nav className="hidden lg:flex items-center gap-6">
              {navItems.map((item) => (
                <a 
                  key={item.name} 
                  href={item.href} 
                  className="text-[14px] font-bold text-gray-400 hover:text-white transition-colors"
                >
                  {item.name}
                </a>
              ))}
              <span className="text-[14px] font-bold text-red-500 italic animate-pulse">COUPON SHOP</span>
            </nav>
          </div>

          {/* 2. 우측 버튼 섹션 */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <button className="px-3 py-1.5 rounded-lg border border-blue-900/50 bg-blue-900/10 text-[11px] font-bold text-blue-400 hover:bg-blue-900/20 transition-all shadow-[0_0_10px_rgba(30,64,175,0.2)]">
                다낭놀자
              </button>
              <button className="px-3 py-1.5 rounded-lg border border-green-900/50 bg-green-900/10 text-[11px] font-bold text-green-400 hover:bg-green-900/20 transition-all shadow-[0_0_10px_rgba(6,95,70,0.2)]">
                나트랑놀자
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-gray-500 font-black tracking-widest uppercase">Member</span>
                  <span className="text-sm font-black text-white">
                    {user.user_metadata?.nickname || user.email?.split('@')[0]}님
                  </span>
                </div>
                <button 
                  onClick={() => signOut()}
                  className="px-5 py-2 text-xs font-black bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => openAuth('signup')}
                  className="text-[13px] font-bold text-gray-300 hover:text-white px-3 py-2 transition-colors"
                >
                  회원가입
                </button>
                <button 
                  onClick={() => openAuth('login')}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-[13px] font-black transition-all active:scale-95 shadow-lg shadow-red-600/20"
                >
                  로그인
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        initialView={authView} 
      />
    </>
  );
};

export default Header;
