import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';

const NoticeEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_important: false
  });

  useEffect(() => {
    if (id && !authLoading) {
      fetchNotice();
    }
  }, [id, authLoading]);

  const fetchNotice = async () => {
    try {
      const { data, error } = await supabase.from('notices').select('*').eq('id', id).single();
      if (error) throw error;
      if (data) {
        setFormData({ title: data.title, content: data.content, is_important: data.is_important });
      }
    } catch (err) {
      alert('아카이브를 불러올 수 없습니다.');
      navigate('/notice');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const { error } = await supabase.from('notices').update(formData).eq('id', id);
      if (error) throw error;
      alert('아카이브 수정이 완료되었습니다.');
      navigate('/notice');
    } catch (err) {
      alert('수정 중 서버 오류가 발생했습니다.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading || authLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-red-600 font-black animate-pulse uppercase tracking-widest italic">Syncing HQ Archives...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto bg-[#0f0f0f] rounded-[3.5rem] p-10 md:p-16 border border-white/5 shadow-2xl">
        <header className="mb-12 border-l-8 border-red-600 pl-8">
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">
            Modify <span className="text-red-600">Bulletin</span>
          </h2>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="bg-black/40 p-10 rounded-[2.5rem] border border-white/5 flex items-center justify-between">
            <p className="text-xl font-black text-red-600 italic uppercase">🔥 Priority Override</p>
            <button 
              type="button" 
              onClick={() => setFormData({...formData, is_important: !formData.is_important})}
              className={`w-20 h-10 rounded-full relative transition-all duration-500 ${formData.is_important ? 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-gray-800'}`}
            >
              <div className={`absolute top-1 w-8 h-8 bg-white rounded-full transition-all duration-300 ${formData.is_important ? 'left-11' : 'left-1'}`} />
            </button>
          </div>

          <div className="space-y-6">
            <input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-2xl px-8 py-5 text-white focus:border-red-600 outline-none transition-all text-3xl italic font-bold" />
            <textarea required rows={15} value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-2xl px-8 py-5 text-white focus:border-red-600 outline-none transition-all resize-none h-96 leading-relaxed font-medium italic shadow-inner" />
          </div>

          <div className="flex gap-6">
            <button type="button" onClick={() => navigate(-1)} className="flex-1 py-7 bg-white/5 text-gray-500 font-black rounded-[1.5rem] uppercase italic">Cancel</button>
            <button type="submit" disabled={updating} className="flex-[2] py-7 bg-red-600 text-white font-black text-xl rounded-[1.5rem] uppercase italic shadow-2xl shadow-red-900/40">
              {updating ? 'Updating Data...' : 'Confirm Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoticeEdit;
