import React, { useState } from 'react';
import { supabase } from '../supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView = 'login' }) => {
  const [isSignUp, setIsSignUp] = useState(initialView === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // 1. 이메일 인증 처리
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nickname } // 메타데이터에 닉네임 저장
          }
        });
        if (error) throw error;
        alert('회원가입 확인 이메일이 발송되었습니다!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. 구글 소셜 로그인
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
        {/* 장식용 배경 빛 */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/10 blur-[80px] rounded-full" />
        
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">✕</button>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2 tracking-tighter italic">
            {isSignUp ? 'JOIN US' : 'WELCOME BACK'}
          </h2>
          <p className="text-gray-400 mb-8 text-sm font-bold">
            {isSignUp ? '호놀자에서 더 즐거운 여행을 시작하세요.' : '로그인하고 호치민의 최신 정보를 확인하세요.'}
          </p>

          <form onSubmit={handleAuth} className="flex flex-col gap-3">
            {isSignUp && (
              <input 
                type="text" placeholder="닉네임" required
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-red-600 outline-none transition-all placeholder:text-gray-600 text-sm"
                value={nickname} onChange={(e) => setNickname(e.target.value)}
              />
            )}
            <input 
              type="email" placeholder="이메일 주소" required
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-red-600 outline-none transition-all placeholder:text-gray-600 text-sm"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
            <input 
              type="password" placeholder="비밀번호" required
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-red-600 outline-none transition-all placeholder:text-gray-600 text-sm"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              type="submit" disabled={loading}
              className="w-full py-4 mt-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-red-600/20"
            >
              {loading ? '처리 중...' : (isSignUp ? '회원가입' : '로그인')}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="bg-[#0f0f0f] px-3 text-gray-500 font-bold">Social Login</span></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full py-4 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-all active:scale-95 shadow-xl"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="google" />
            Google로 계속하기
          </button>

          <p className="mt-8 text-center text-sm text-gray-500 font-bold">
            {isSignUp ? '이미 계정이 있으신가요?' : '아직 회원이 아니신가요?'}
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-2 text-red-500 hover:underline"
            >
              {isSignUp ? '로그인하기' : '회원가입하기'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
