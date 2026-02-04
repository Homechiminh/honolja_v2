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

  // 🔴 기존에 있던 'if (!isAdmin) navigate("/")' 코드를 삭제했습니다.
  // App.tsx의 AdminRoute가 이미 관리자임을 보장하기 때문입니다.

  useEffect(() => {
    const fetchNotice = async () => {
      if (!id || !initialized) return;
      try {
        const { data, error } = await supabase.from('notices').select('*').eq('id', id).single();
        if (error) throw error;
        if (data) {
          setFormData({ title: data.title, content: data.content, is_important: data.is_important });
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
    setUpdating(true);
    try {
      const { error } = await supabase.from('notices').update(formData).eq('id', id);
      if (error) throw error;
      alert('수정되었습니다.');
      navigate('/notice');
    } catch (err) {
      alert('오류가 발생했습니다.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans">
      <Helmet><title>공지사항 수정 | 관리자</title></Helmet>
      <div className="max-w-4xl mx-auto bg-[#0f0f0f] rounded-[2rem] p-8 border border-white/5">
        <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter italic">Edit <span className="text-red-600">Notice</span></h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            className="w-full bg-black border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-red-600"
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            placeholder="제목"
          />
          <textarea 
            className="w-full bg-black border border-white/10 rounded-xl px-6 py-4 h-64 outline-none focus:border-red-600"
            value={formData.content} 
            onChange={e => setFormData({...formData, content: e.target.value})} 
            placeholder="내용"
          />
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={formData.is_important} 
              onChange={e => setFormData({...formData, is_important: e.target.checked})} 
            />
            <label>중요 공지사항</label>
          </div>
          <button 
            type="submit" 
            disabled={updating}
            className="w-full py-4 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all"
          >
            {updating ? '수정 중...' : '수정 완료'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NoticeEdit;
