import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { useFetchGuard } from '../hooks/useFetchGuard';

const Notice: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFetchGuard(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('is_important', { ascending: false }) // 중요 공지 상단 고정
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotices(data || []);
    } catch (err) {
      console.error('Notice load failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans selection:bg-red-600/30">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
              Official <span className="text-red-600">Notice</span>
            </h2>
            <p className="text-gray-500 font-bold uppercase text-[10px] mt-4 italic tracking-[0.3em]">HQ Intelligence & Guidelines</p>
          </div>
          {currentUser?.role === 'ADMIN' && (
            <button 
              onClick={() => navigate('/notice/create')}
              className="px-8 py-4 bg-white text-black font-black text-xs rounded-2xl uppercase italic hover:bg-red-600 hover:text-white transition-all shadow-2xl active:scale-95"
            >
              New Announcement
            </button>
          )}
        </header>

        <div className="space-y-6">
          {loading ? (
            <div className="py-20 text-center text-gray-700 font-black italic animate-pulse tracking-widest uppercase">Syncing HQ Database...</div>
          ) : notices.length === 0 ? (
            <div className="py-32 text-center bg-[#0f0f0f] rounded-[3rem] border border-dashed border-white/5">
              <p className="text-gray-600 font-black italic uppercase tracking-widest">No Bulletins Issued Yet.</p>
            </div>
          ) : (
            notices.map((notice) => (
              <div 
                key={notice.id}
                className={`group relative bg-[#0f0f0f] rounded-[2.5rem] border transition-all duration-500 overflow-hidden shadow-2xl ${
                  notice.is_important ? 'border-red-600/30' : 'border-white/5 hover:border-red-600/20'
                }`}
              >
                <div className="p-10 flex flex-col md:flex-row md:items-center gap-8">
                  <div className="flex-grow space-y-4">
                    <div className="flex items-center gap-4">
                      {notice.is_important && (
                        <span className="bg-red-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase italic animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.5)]">Important</span>
                      )}
                      <span className="text-gray-600 font-black text-[10px] uppercase italic tracking-[0.2em]">
                        {new Date(notice.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className={`text-3xl font-black italic tracking-tighter group-hover:text-red-500 transition-colors leading-tight ${notice.is_important ? 'text-white' : 'text-gray-300'}`}>
                      {notice.title}
                    </h3>
                    <p className="text-gray-500 text-sm font-medium line-clamp-2 opacity-60 italic leading-relaxed">{notice.content}</p>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    {currentUser?.role === 'ADMIN' && (
                      <button 
                        onClick={() => navigate(`/notice/edit/${notice.id}`)}
                        className="px-6 py-2 bg-white/5 rounded-xl hover:bg-white/10 text-gray-500 hover:text-white transition-all text-[10px] font-black uppercase italic border border-white/5"
                      >
                        Modify
                      </button>
                    )}
                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-red-600 group-hover:rotate-45 transition-all duration-500 shadow-xl">
                      <span className="text-white text-2xl font-light">→</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notice;
