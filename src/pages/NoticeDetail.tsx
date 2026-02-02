import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { useFetchGuard } from '../hooks/useFetchGuard';

const NoticeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, initialized } = useAuth();
  const [notice, setNotice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchNotice = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('notices').select('*').eq('id', id).single();
      if (error) throw error;
      setNotice(data);
    } catch (err: any) {
      console.error('Notice Fetch Error:', err.message);
      navigate('/notice');
    } finally {
      setLoading(false);
    }
  };

  useFetchGuard(fetchNotice, [id]);

  if (!initialized || loading || !notice) return (
    <div className="min-h-screen bg-black flex items-center justify-center font-black animate-pulse text-white uppercase italic">Decrypting HQ Intel...</div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 font-sans selection:bg-red-600/30">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
        <div className="bg-[#0f0f0f] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
          <header className="p-10 md:p-14 border-b border-white/5">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-4 py-1 bg-red-600 text-white text-[10px] font-black rounded-full uppercase italic tracking-widest">OFFICIAL BULLETIN</span>
              <span className="text-gray-600 font-black text-[10px] uppercase italic tracking-[0.2em]">{new Date(notice.created_at).toLocaleString()}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter leading-tight break-keep">{notice.title}</h1>
          </header>
          
          <article className="p-10 md:p-14 text-gray-300 text-lg md:text-xl leading-relaxed whitespace-pre-wrap font-medium italic opacity-80">
            {notice.content}
          </article>
        </div>

        <div className="flex justify-between items-center px-4">
          <button onClick={() => navigate('/notice')} className="text-gray-700 hover:text-white font-black uppercase italic text-xs tracking-[0.3em] transition-all">← Return to Headquarters</button>
          {currentUser?.role === 'ADMIN' && (
            <button onClick={() => navigate(`/notice/edit/${id}`)} className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-500 hover:text-red-500 font-black text-[10px] uppercase italic transition-all">Edit Record</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoticeDetail;
