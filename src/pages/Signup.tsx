import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { BRAND_NAME } from '../constants';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', nickname: '' });

  // 1. 구글 연동 가입 (OAuth)
  const handleGoogleSignup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: window.location.origin 
        }
      });
      if (error) throw error;
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 2. 이메일 가입 로직
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { 
          // 🔴 닉네임을 유저 메타데이터에 포함하여 profiles 테이블과 연동되게 함
          data: { nickname: formData.nickname } 
        }
      });

      if (error) throw error;

      if (data.user) {
        alert('회원가입 성공! 로그인 페이지로 이동합니다.');
        navigate('/login');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = "w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-red-600 outline-none transition-all shadow-inner placeholder:text-gray-700 font-bold";

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-20 relative overflow-hidden font-sans">
      {/* 배경 장식 */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-600 rounded-full blur-[160px]"></div>
      </div>

      <div className="max-w-xl w-full relative z-10">
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center space-x-3 mb-8 group">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
              <span className="text-white font-black text-2xl italic">H</span>
            </div>
            <span className="text-3xl font-black tracking-tighter text-white uppercase italic">{BRAND_NAME}</span>
          </Link>
          <h2 className="text-white text-3xl font-black italic tracking-tighter uppercase leading-none">Join to play !</h2>
        </div>

        <div className="bg-[#111] p-10 md:p-14 rounded-[3rem] border border-white/5 shadow-2xl">
          {/* 구글 연동 버튼 */}
          <div className="mb-12">
            <button 
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center space-x-4 bg-white text-black py-5 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>구글로 1초 만에 가입하기</span>
            </button>
          </div>

          <div className="relative my-12 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <span className="relative bg-[#111] px-6 text-[10px] text-slate-600 font-black uppercase tracking-widest italic">Or create a manual account</span>
          </div>

          {/* 단계 표시 바 */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 w-16 rounded-full transition-all duration-500 ${step >= i ? 'bg-red-600' : 'bg-white/5'}`}></div>
            ))}
          </div>

          <form className="space-y-8" onSubmit={handleSignup}>
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="space-y-4">
                  <input type="text" placeholder="Nickname" value={formData.nickname} onChange={e => setFormData({...formData, nickname: e.target.value})} className={inputStyle} required />
                  <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputStyle} required />
                </div>
                <button 
                  type="button" 
                  onClick={() => formData.nickname && formData.email && setStep(2)} 
                  className="w-full py-5 bg-white text-black rounded-2xl font-black text-lg hover:bg-red-600 hover:text-white transition-all shadow-xl uppercase italic active:scale-95"
                >
                  다음 단계로
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <input type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className={inputStyle} required minLength={6} />
                <div className="flex space-x-4">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 py-5 bg-white/5 text-white rounded-2xl font-black text-lg border border-white/10 transition-all italic uppercase">이전</button>
                  <button 
                    type="button" 
                    onClick={() => formData.password.length >= 6 && setStep(3)} 
                    className="flex-1 py-5 bg-white text-black rounded-2xl font-black text-lg hover:bg-red-600 hover:text-white transition-all uppercase italic"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 text-slate-400 text-sm font-bold leading-relaxed">
                  <p className="mb-2 text-white italic tracking-tighter uppercase">Terms & Policy</p>
                  {BRAND_NAME}의 서비스 이용약관 및 <br/>개인정보 처리방침에 동의하여 가입을 진행합니다.
                </div>
                <div className="flex space-x-4">
                  <button type="button" onClick={() => setStep(2)} className="flex-1 py-5 bg-white/5 text-white rounded-2xl font-black text-lg border border-white/10 transition-all italic uppercase">이전</button>
                  <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="flex-1 py-5 bg-red-600 text-white rounded-2xl font-black text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 active:scale-95 uppercase italic"
                  >
                    {isLoading ? 'Processing...' : '회원가입 완료'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <p className="text-center mt-8 text-slate-500 text-sm font-bold uppercase tracking-widest">
          이미 계정이 있으신가요? 
          <Link to="/login" className="text-red-500 font-black ml-2 hover:text-red-400 border-b-2 border-transparent hover:border-red-400 transition-all pb-0.5">
            로그인하기
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
