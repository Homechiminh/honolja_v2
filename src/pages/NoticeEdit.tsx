import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; // SEO용
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext'; 
import { useFetchGuard } from '../hooks/useFetchGuard'; 

const NoticeEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // 1. 전역 인증 정보 및 초기화 상태 가져오기 (initialized 추가)
  const { currentUser, loading: authLoading, initialized } = useAuth(); 
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_important: false
  });

  /**
   * 🔴 [보안 가드] 관리자 권한 체크 로직
   * 초기화가 완료된 후, 관리자가 아니면 홈으로 보냅니다.
   */
  useEffect(() => {
    if (initialized) {
      if (!currentUser || currentUser.role !== 'ADMIN') {
        navigate('/', { replace: true });
      }
    }
  }, [initialized, currentUser, navigate]);

  /**
   * 🔴 [방탄 fetch] 기존 공지사항 데이터 로드
   */
  const fetchNotice = async () => {
    if (!id || !initialized) return; // 초기화 전에는 실행 방지
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({ 
          title: data.title, 
          content: data.content, 
          is_important: data.is_important 
        });
      }
    } catch (err: any) {
      console.error('HQ Archive Sync Error:', err.message);
      alert('데이터를 불러올 수 없습니다.');
      navigate('/notice');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔴 데이터 가드 적용 (id와 initialized가 준비되면 실행)
   */
  useFetchGuard(fetchNotice, [id, initialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('notices')
        .update(formData)
        .eq('id', id);

      if (error) throw error;

      alert('아카이브 수정이 완료되었습니다.');
      navigate('/notice');
    } catch (err) {
      alert('수정 중 서버 오류가 발생했습니다.');
    } finally {
      setUpdating(false);
    }
  };

  // 🔴 튕김 방지 핵심: 초기화 중이거나 로딩 중일 때는 로딩 화면 유지
  if (!initialized || (authLoading && !currentUser) || loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-red-600 font-black animate-pulse uppercase tracking-widest italic text-xl">
        Syncing HQ Archives...
      </div>
    </div>
  );

  const inputStyle = "w-full bg-[#111] border border-white/10 rounded-2xl px-8 py-5 text-white focus:border-red-600 outline-none transition-all font-bold italic shadow-inner placeholder:text-gray-800";

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans selection:bg-red-600/30">
      {/* SEO 설정 */}
      <Helmet>
        <title>호놀자 관리자 | 공지사항 수정</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="max-w-4xl mx-auto bg-[#0f0f0f] rounded-[3rem] p-10 md:p-16 border border-white/5 shadow-2xl">
        <header className="mb-12 border-l-8 border-red-600 pl-8">
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
            Modify <span className="text-red-600">Bulletin</span>
          </h2>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in duration-700">
          {/* 중요 공지 토글 섹션 */}
          <div className="bg-black/40 p-10 rounded-[2.5rem] border border-white/5 flex items-center justify-between shadow-inner">
            <p className="text-xl font-black text-red-600 italic uppercase tracking-tight">🔥 Priority Override</p>
            <button 
              type="button" 
              onClick={() => setFormData({...formData, is_important: !formData.is_important})}
              className={`w-20 h-10 rounded-full relative transition-all duration-500 ${formData.is_important ? 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-gray-800'}`}
            >
              <div className={`absolute top-1 w-8 h-8 bg-white rounded-full transition-all duration-300 ${formData.is_important ? 'left-11 shadow-lg' : 'left-1'}`} />
            </button>
          </div>

          {/* 입력 섹션 */}
          <div className="space-y-6">
            <input 
              required 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              className={`${inputStyle} text-3xl py-7 tracking-tighter`}
              placeholder="Headline"
            />
            <textarea 
              required 
              rows={15} 
              value={formData.content} 
              onChange={(e) => setFormData({...formData, content: e.target.value})} 
              className={`${inputStyle} resize-none h-96 leading-relaxed font-medium italic`}
              placeholder="Notice Content"
            />
          </div>

          {/* 버튼 섹션 */}
          <div className="flex gap-6">
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              className="flex-1 py-7 bg-white/5 text-gray-500 font-black rounded-[1.5rem] uppercase italic border border-white/5 hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={updating} 
              className="flex-[2] py-7 bg-red-600 text-white font-black text-xl rounded-[1.5rem] uppercase italic shadow-2xl shadow-red-900/40 hover:bg-red-700 transition-all active:scale-95"
            >
              {updating ? 'Updating HQ...' : 'Confirm Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoticeEdit;
