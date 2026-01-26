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
    { name: '바/클럽', href: '#' },
    { name: '커뮤니티', href: '#' },
  ];

  const openAuth = (view: 'login' | 'signup') => {
    setAuthView(view);
    setIsAuthOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-10">
            <h1 className="text-2xl font-black tracking-tighter cursor-pointer group" onClick={() => window.location.href = '/'}>
              HONOLJA<span className="text-red-600 group-hover:animate-pulse">.</span>
            </h1>
            
            <nav className="hidden lg:flex items-center gap-8 text-sm font-bold text-gray-400">
              {navItems.map((item) => (
                <a key={item.name} href={item.href} className="hover:text-white transition-colors duration-200">{item.name}</a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Member</span>
                  <span className="text-sm font-black text-white">{user.user_metadata.nickname || user.email?.split('@')[0]}님</span>
                </div>
                <button 
                  onClick={() => signOut()}
                  className="px-5 py-2 text-xs font-black bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all active:scale-95"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => openAuth('signup')}
                  className="text-sm font-bold px-4 py-2 hover:text-red-500 transition-colors"
                >
                  회원가입
                </button>
                <button 
                  onClick={() => openAuth('login')}
                  className="px-6 py-2 text-sm font-black bg-red-600 hover:bg-red-700 rounded-full transition-all active:scale-95 shadow-lg shadow-red-600/20"
                >
                  로그인
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 실제 인증 모달 컴포넌트 */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        initialView={authView} 
      />
    </>
  );
};

export default Header;
