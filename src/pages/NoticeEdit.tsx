import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext'; 

const NoticeEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { initialized } = useAuth(); 
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_important: false
  });

  // 초기 데이터 로드 + 임시 저장 데이터 확인
  useEffect(() => {
    const fetchNotice = async () => {
      if (!id || !initialized) return;
      try {
        const { data, error } = await supabase.from('notices').select('*').eq('id', id).single();
        if (error) throw error;

        // 🔴 탭 전환 시 데이터 보존을 위해 세션 스토리지 체크
        const savedDraft = sessionStorage.getItem(`notice_draft_${id}`);
        if (savedDraft) {
          setFormData(JSON.parse(savedDraft));
        } else if (data) {
          setFormData({ 
            title: data.title, 
            content: data.content, 
            is_important: data.is_important 
          });
        }
      } catch (err: any) {
        console.error('Error:', err.message);
        navigate('/notice');
      } finally {
        setLoading(false);
      }
    };
    fetchNotice();
  }, [id, initialized, navigate]);

  // 🔴 작성 중 내용 실시간 임시 저장 (탭 전환 대비)
  useEffect(() => {
    if (!loading && id) {
      sessionStorage.setItem(`notice_draft_${id}`, JSON.stringify(formData));
    }
  }, [formData, loading, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('notices')
        .update({
          title: formData.title,
          content: formData.content,
          is_important: formData.is_important,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // 성공 시 임시 저장 데이터 삭제
      sessionStorage.removeItem(`notice_draft_${id}`);
      
      alert('성공적으로 수정되었습니다.');
      navigate(`/notice/${id}`, { replace: true });
      
    } catch (err: any) {
      console.error('Update Error:', err.message);
      alert('오류가 발생했습니다: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center font-black animate-pulse text-white uppercase italic tracking-widest">
      데이터 로딩 중...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans">
      <Helmet><title>공지사항 수정 | 관리자</title></Helmet>
      <div className="max-w-4xl mx-auto bg-[#0f0f0f] rounded-[2.5rem] p-10 md:p-14 border border-white/5 shadow-2xl">
        <h2 className="text-4xl font-black mb-10 uppercase tracking-tighter italic text-white">
          공지사항 <span className="text-red-600">수정</span>
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-black uppercase italic tracking-widest ml-4">제목</label>
            <input 
              className="w-full bg-black border border-white/10 rounded-2xl px-8 py-5 text-white focus:border-red-600 outline-none transition-all font-bold text-xl italic"
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              placeholder="공지 제목을 입력하세요"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-black uppercase italic tracking-widest ml-4">본문 내용</label>
            <textarea 
              className="w-full bg-black border border-white/10 rounded-[2rem] px-8 py-8 h-96 text-white focus:border-red-600 outline-none transition-all font-medium leading-relaxed resize-none italic"
              value={formData.content} 
              onChange={e => setFormData({...formData, content: e.target.value})} 
              placeholder="공지 내용을 입력하세요"
            />
          </div>

          <div className="flex items-center gap-4 bg-white/5 p-6 rounded-2xl border border-white/5">
            <input 
              type="checkbox" 
              id="important"
              className="w-5 h-5 accent-red-600 cursor-pointer"
              checked={formData.is_important} 
              onChange={e => setFormData({...formData, is_important: e.target.checked})} 
            />
            <label htmlFor="important" className="text-white font-black italic cursor-pointer uppercase text-xs tracking-tighter">
              중요 공지사항으로 설정
            </label>
          </div>

          <div className="flex gap-4 pt-6">
            <button 
              type="button"
              onClick={() => {
                sessionStorage.removeItem(`notice_draft_${id}`);
                navigate(-1);
              }}
              className="flex-1 py-5 bg-white/5 text-gray-400 font-black rounded-2xl hover:bg-white/10 transition-all uppercase italic text-xs"
            >
              취소
            </button>
            <button 
              type="submit" 
              disabled={updating}
              className="flex-[2] py-5 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 uppercase italic text-lg"
            >
              {updating ? '수정 중...' : '수정 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoticeEdit;
