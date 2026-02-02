import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { BRAND_NAME } from '../constants';
import { useAuth } from '../contexts/AuthContext'; 

const Login: React.FC = () => {
  const { currentUser, initialized } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 세션이 확인되면 즉시 홈으로 이동
  useEffect(() => {
    if (initialized && currentUser) {
      window.location.replace('/');
    }
  }, [currentUser, initialized]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true); 

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.user) {
        // 🔴 Pro 플랜이므로 즉시 반영됩니다. 강제 새로고침 이동.
        window.location.replace('/'); 
      }
    } catch (err: any) {
      console.error("Login Error:", err.message);
      alert(err.message === 'Invalid login credentials' ? '이메일 또는 비밀번호를 확인해주세요.' : err.message);
      setIsLoading(false);
    }
  };

  // 🔴 [수정] 아무것도 안 보여주는 대신 로딩 중임을 표시합니다.
  if (!initialized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-black animate-pulse tracking-widest uppercase">
          Initializing Secure Session...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-20 relative overflow-hidden font-sans">
      <div className="max-w-md w-full relative z-10 animate-in fade-in duration-700">
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center space-x-3 mb-8 group">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
              <span className="text-white font-black text-2xl italic">H</span>
            </div>
            <span className="text-3xl font-black text-white uppercase italic tracking-tighter">{BRAND_NAME}</span>
          </Link>
          <h2 className="text-white text-2xl font-black italic uppercase tracking-tighter">Welcome Back !</h2>
        </div>

        <div className="bg-[#111] p-8 md:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <form className="space-y-6" onSubmit={handleFormSubmit}>
            <div className="space-y-4">
              <input id="login-email" name="email" type="email" placeholder="Email Address" required autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-red-600 outline-none transition-all placeholder:text-gray-700" />
              <input id="login-password" name="password" type="password" placeholder="Password" required autoComplete="current-password"
                value={password} onChange={e => setPassword(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-red-600 outline-none transition-all placeholder:text-gray-700" />
            </div>
            <button type="submit" disabled={isLoading} 
              className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-lg hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-tighter italic">
              {isLoading ? 'VERIFYING...' : `Login to ${BRAND_NAME}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
