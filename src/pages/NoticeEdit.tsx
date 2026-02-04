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

  // 1. 초기 데이터 로드 및 임시 저장 데이터 복구
  useEffect(() => {
    const fetchNotice = async () => {
      if (!id || !initialized) return;
      try {
        const { data, error } = await supabase
          .from('notices')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        // 🔴 데이터 보존 로직: 탭 전환 시 작업 내역이 있으면 우선 적용
        const savedDraft = sessionStorage.getItem(`notice_edit_draft_${id}`);
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

  // 2. 🔴 실시간 자동 저장 (데이터 유실 방지)
  useEffect(() => {
    if (!loading && id) {
      sessionStorage.setItem(`notice_edit_draft_${id}`, JSON.stringify(formData));
    }
  }, [formData, loading, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 입력해주세요.');
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

      // ✅ 성공 시 임시 저장 삭제
      sessionStorage.removeItem(`notice_edit_draft_${id}`);

      alert('성공적으로 수정되었습니다.');
      navigate(`/notice/${id}`, { replace: true });
      
    } catch (err: any) {
      console.error('Update Error:', err.message);
      alert('수정 중 오류가 발생했습니다.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center font-black animate-pulse text-red-600 uppercase italic tracking-widest">
      Loading HQ Archives...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans">
      <Helmet><title>공지사항 수정 | 관리자</title></Helmet>
      <div className="max-w-4xl mx-auto bg-[#0f0f0f] rounded-[2rem] p-10 md:p-14 border border-white/5 shadow-2xl">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter italic text-white leading-none">
            Edit <span className="text-red-600">Notice</span>
          </h2>
          <span className="text-[10px] text-emerald-500 font-bold animate-pulse italic">● 자동 저장 활성화됨</span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            className="w-full bg-black border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-red-600 text-white font-bold italic"
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            placeholder="제목"
          />
          <textarea 
            className="w-full bg-black border border-white/10 rounded-xl px-6 py-4 h-96 outline-none focus:border-red-600 text-white leading-relaxed resize-none italic"
            value={formData.content} 
            onChange={e => setFormData({...formData, content: e.target.value})} 
            placeholder="내용"
          />
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
            <input 
              type="checkbox" 
              id="important"
              className="w-5 h-5 accent-red-600"
              checked={formData.is_important} 
              onChange={e => setFormData({...formData, is_important: e.target.checked})} 
            />
            <label htmlFor="important" className="text-sm font-bold text-gray-400 italic">중요 공지사항으로 설정</label>
          </div>
          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={() => {
                sessionStorage.removeItem(`notice_edit_draft_${id}`);
                navigate(-1);
              }} 
              className="flex-1 py-4 bg-white/5 text-gray-500 font-black rounded-xl italic border border-white/5"
            >
              취소
            </button>
            <button type="submit" disabled={updating} className="flex-[2] py-4 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all shadow-xl">
              {updating ? '수정 중...' : '수정 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoticeEdit;
