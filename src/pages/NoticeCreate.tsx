import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; 
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

const NoticeCreate: React.FC = () => {
  const navigate = useNavigate();
  
  // 1. 전역 인증 상태 구독 (initialized 추가)
  const { currentUser, loading: authLoading, initialized } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_important: false
  });

  // 2. 🔴 관리자 권한 보안 가드 (튕김 방지 핵심)
  // 초기화가 완전히 끝난 후에 관리자가 아니면 홈으로 보냅니다.
  useEffect(() => {
    if (initialized) {
      if (!currentUser || currentUser.role !== UserRole.ADMIN) {
        navigate('/', { replace: true });
      }
    }
  }, [initialized, currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('notices').insert([{
        ...formData,
        author_id: currentUser?.id
      }]);

      if (error) throw error;

      alert('HQ Announcement가 성공적으로 브로드캐스팅되었습니다.');
      navigate('/notice');
    } catch (err: any) {
      console.error("Notice Transmission Error:", err.message);
      alert(`전송 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full bg-[#111] border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-red-600 outline-none transition-all placeholder:text-gray-800 font-bold italic";

  // 🔴 인증 확인 중이거나 로딩 중일 때 로딩 UI
  if (!initialized || (authLoading && !currentUser)) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-red-600 font-black animate-pulse uppercase tracking-[0.3em] text-xl italic">
        ACCESSING HQ TERMINAL...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans selection:bg-red-600/30">
      {/* 🔴 SEO 최적화 (관리자 페이지 노출 차단) */}
      <Helmet>
        <title>호놀자 관리자 | 공지사항 작성</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="max-w-4xl mx-auto bg-[#0f0f0f] rounded-[3rem] p-10 md:p-16 border border-white/5 shadow-2xl">
        <header className="mb-12 border-l-8 border-red-600 pl-8">
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
            Issue <span className="text-red-600">Bulletin</span>
          </h2>
          <p className="text-gray-500 text-[10px] font-black uppercase mt-4 tracking-[0.2em] italic">본부 중요 지침 하달 섹션</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in duration-700">
          {/* 중요 공지 토글 섹션 */}
          <div className="bg-black/40 p-8 rounded-[2rem] border border-white/5 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-4">
              <span className="text-2xl">📌</span>
              <p className="text-xl font-black text-red-600 italic uppercase tracking-tighter">Set as Important</p>
            </div>
            <button 
              type="button" 
              onClick={() => setFormData({...formData, is_important: !formData.is_important})}
              className={`w-20 h-10 rounded-full relative transition-all duration-500 ${formData.is_important ? 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-gray-800'}`}
            >
              <div className={`absolute top-1 w-8 h-8 bg-white rounded-full transition-all duration-300 ${formData.is_important ? 'left-11 shadow-lg' : 'left-1'}`} />
            </button>
          </div>

          {/* 제목 및 내용 입력 섹션 */}
          <div className="space-y-6">
            <input 
              required
              placeholder="Notice Headline"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className={`${inputStyle} text-2xl py-6 tracking-tighter`}
            />
            <textarea 
              required
              rows={15}
              placeholder="Intelligence details here..."
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className={`${inputStyle} resize-none h-96 leading-relaxed font-medium italic`}
            />
          </div>

          {/* 하단 버튼 섹션 */}
          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="flex-1 py-6 bg-white/5 text-gray-500 font-black rounded-2xl uppercase italic hover:bg-white/10 transition-all border border-white/5"
            >
              Discard
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-[2] py-6 bg-red-600 text-white font-black text-xl rounded-2xl uppercase shadow-2xl shadow-red-900/40 hover:bg-red-500 transition-all active:scale-95 italic"
            >
              {loading ? 'Transmitting...' : 'Broadcast Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoticeCreate;
