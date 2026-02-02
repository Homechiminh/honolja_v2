import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { BRAND_NAME } from '../constants';
import { useAuth } from '../contexts/AuthContext'; 

const Login: React.FC = () => {
  const navigate = useNavigate();
  
  // 1. 전역 인증 정보 구독
  const { currentUser, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 🔴 [보안 가드] 이미 로그인된 유저는 홈으로 리다이렉트
   * authLoading이 끝난 시점에 currentUser가 있다면 로그인 페이지에 머물 수 없게 합니다.
   */
  useEffect(() => {
    if (!authLoading && currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, authLoading, navigate]);

  // 1. 구글 연동 로그인 (OAuth)
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: window.location.origin 
        }
      });
      if (error) throw error;
      // OAuth는 페이지 이동이 일어나므로 보통 여기서 정지하지만, 
      // 에러 대비를 위해 catch/finally를 구성합니다.
    } catch (err: any) {
      console.error("Google Auth Error:", err.message);
      alert(err.message);
      setIsLoading(false); // 구글 창이 안 뜰 경우 로딩 해제
    }
  };

  /**
   * 🔴 [방탄 Logic] 이메일 로그인
   * 에러가 발생해도 finally 블록이 버튼의 'Verifying...' 상태를 해제합니다.
   */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true); // 로딩 시작
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        // 🔴 잘못된 비밀번호 등의 에러 발생 시 catch로 던짐
        throw error;
      }
      
      // 성공 시에는 상단의 useEffect 가드가 감지하여 자동으로 홈으로 이동시킵니다.
    } catch (err: any) {
      console.error("Login Submission Error:", err.message);
      alert(err.message === 'Invalid login credentials' ? '이메일 또는 비밀번호를 확인해주세요.' : err.message);
    } finally {
      // 🔴 핵심: 성공하든 실패하든 버튼의 무한 로딩 방지
      setIsLoading(false);
    }
  };

  /**
   * 🔴 인증 확인 중일 때 깜빡임 방지
   * 유저가 로그인 상태인지 확인하는 0.1~0.5초 동안 로그인 폼을 보여주지 않고 null을 반환하여 
   * '로그인 창이 보였다가 홈으로 튕기는' 현상을 막습니다.
   */
  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-20 relative overflow-hidden font-sans selection:bg-red-600/30">
      {/* 배경 장식 - 디자인 유지 */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600 rounded-full blur-[160px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[160px]"></div>
      </div>

      <div className="max-w-md w-full relative z-10 animate-in fade-in duration-700">
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center space-x-3 mb-8 group">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
              <span className="text-white font-black text-2xl italic">H</span>
            </div>
            <span className="text-3xl font-black tracking-tighter text-white uppercase italic">{BRAND_NAME}</span>
          </Link>
          <h2 className="text-white text-2xl font-black italic tracking-tighter uppercase leading-none">Welcome Back !</h2>
        </div>

        <div className="bg-[#111] p-8 md:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
          {/* 구글 로그인 버튼 */}
          <div className="mb-8">
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-4 bg-white text-black py-4 rounded-2xl font-black text-sm hover:scale-[1.02] transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>{isLoading ? '연결 중...' : '구글 계정으로 계속하기'}</span>
            </button>
          </div>

          <div className="relative my-10 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <span className="relative bg-[#111] px-4 text-[10px] text-slate-600 font-black uppercase tracking-widest italic">Or login with email</span>
          </div>

          <form className="space-y-6" onSubmit={handleFormSubmit}>
            <div className="space-y-4">
              <input 
                type="email" 
                placeholder="Email Address" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-red-600 outline-none transition-all shadow-inner placeholder:text-gray-700" 
              />
              <input 
                type="password" 
                placeholder="Password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-red-600 outline-none transition-all shadow-inner placeholder:text-gray-700" 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 active:scale-95 italic disabled:opacity-50 uppercase tracking-tighter"
            >
              {isLoading ? 'Verifying...' : `Login to ${BRAND_NAME}`}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-slate-500 text-sm font-bold uppercase tracking-widest">
          아직 회원이 아니신가요? 
          <Link to="/signup" className="text-red-500 font-black ml-2 hover:text-red-400 transition-colors border-b-2 border-transparent hover:border-red-400 pb-0.5">
            회원가입하기
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
