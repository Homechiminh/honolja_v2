import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // 🔴 useNavigate 삭제
import { supabase } from '../supabase';
import { BRAND_NAME } from '../constants';
import { useAuth } from '../contexts/AuthContext'; 

const Login: React.FC = () => {
  // const navigate = useNavigate(); 🔴 이 줄을 통째로 삭제하세요.
  const { currentUser, initialized } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialized && currentUser) {
      window.location.href = '/';
    }
  }, [currentUser, initialized]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Google Auth Error:", err.message);
      alert(err.message);
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true); 
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;

      if (data.user) {
        console.log("✅ 로그인 성공! 홈으로 강제 이동합니다.");
        window.location.href = '/'; 
      }
      
    } catch (err: any) {
      console.error("Login Error:", err.message);
      alert(err.message === 'Invalid login credentials' ? '이메일 또는 비밀번호를 확인해주세요.' : err.message);
      setIsLoading(false);
    }
  };

  if (!initialized) return null;

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-20 relative overflow-hidden font-sans selection:bg-red-600/30">
      {/* ... (나머지 UI 코드는 이전과 동일) ... */}
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
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>{isLoading ? '연결 중...' : '구글 계정으로 계속하기'}</span>
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleFormSubmit}>
            <div className="space-y-4">
              <input id="login-email" name="email" type="email" placeholder="Email Address" required autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-red-600 outline-none transition-all" 
              />
              <input id="login-password" name="password" type="password" placeholder="Password" required autoComplete="current-password"
                value={password} onChange={e => setPassword(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-red-600 outline-none transition-all" 
              />
            </div>
            
            <button type="submit" disabled={isLoading} 
              className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-lg hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50 uppercase"
            >
              {isLoading ? 'VERIFYING...' : `Login to ${BRAND_NAME}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
