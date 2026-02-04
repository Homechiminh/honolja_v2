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

  // 초기 데이터 로드
  useEffect(() => {
    const fetchNotice = async () => {
      if (!id || !initialized) return;
      try {
        const { data, error } = await supabase.from('notices').select('*').eq('id', id).single();
        if (error) throw error;
        if (data) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setUpdating(true);
    try {
      // 🔴 데이터 업데이트 실행
      const { error } = await supabase
        .from('notices')
        .update({
          title: formData.title,
          content: formData.content,
          is_important: formData.is_important,
          updated_at: new Date().toISOString() // 수정 시간 명시
        })
        .eq('id', id);

      if (error) throw error;

      alert('성공적으로 수정되었습니다.');
      
      // 🔴 수정 후 목록이 아닌 '해당 상세 페이지'로 이동하여 즉시 반영 확인
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
      Loading HQ Archives...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans">
      <Helmet><title>공지사항 수정 | 관리자</title></Helmet>
      <div className="max-w-4xl mx-auto bg-[#0f0f0f] rounded-[2.5rem] p-10 md:p-14 border border-white/5 shadow-2xl">
        <h2 className="text-4xl font-black mb-10 uppercase tracking-tighter italic text-white">
          Edit <span className="text-red-600">Bulletin</span>
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-black uppercase italic tracking-widest ml-4">Headline</label>
            <input 
              className="w-full bg-black border border-white/10 rounded-2xl px-8 py-5 text-white focus:border-red-600 outline-none transition-all font-bold text-xl italic"
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              placeholder="공지 제목을 입력하세요"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-black uppercase italic tracking-widest ml-4">Content Body</label>
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
              Priority Override (중요 공지 설정)
            </label>
          </div>

          <div className="flex gap-4 pt-6">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-5 bg-white/5 text-gray-400 font-black rounded-2xl hover:bg-white/10 transition-all uppercase italic text-xs"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={updating}
              className="flex-[2] py-5 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 uppercase italic text-lg"
            >
              {updating ? 'Updating...' : 'Publish Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoticeEdit;
