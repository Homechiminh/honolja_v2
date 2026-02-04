import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { useFetchGuard } from '../hooks/useFetchGuard';

const Notice: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, initialized } = useAuth();
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('is_important', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotices(data || []);
    } catch (err: any) {
      console.error('Notice Sync Failed:', err.message);
      setNotices([]); 
    } finally {
      setLoading(false);
    }
  };

  useFetchGuard(fetchNotices, []);

  if (!initialized || (loading && notices.length === 0)) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-red-600 font-black animate-pulse uppercase tracking-[0.3em] italic">Syncing HQ...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 md:px-10 font-sans selection:bg-red-600/30">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
              Official <span className="text-red-600">Notice</span>
            </h2>
            <p className="text-gray-600 font-bold uppercase text-[9px] mt-2 italic tracking-[0.3em]">HQ Intelligence & Guidelines</p>
          </div>
          {currentUser?.role === 'ADMIN' && (
            <button onClick={() => navigate('/notice/create')} className="px-6 py-3 bg-white text-black font-black text-[10px] rounded-xl uppercase italic hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95">+ Create</button>
          )}
        </header>

        <div className="space-y-4">
          {notices.length === 0 ? (
            <div className="py-20 text-center bg-[#0f0f0f] rounded-[2.5rem] border border-dashed border-white/5 italic opacity-30 text-white">No Bulletins Issued.</div>
          ) : (
            notices.map((notice) => (
              <div 
                key={notice.id}
                onClick={() => navigate(`/notice/${notice.id}`)}
                className={`group relative bg-[#0f0f0f] rounded-3xl border border-white/5 p-6 hover:bg-[#151515] hover:border-red-600/30 transition-all cursor-pointer shadow-xl ${
                  notice.is_important ? 'bg-gradient-to-r from-[#111] to-[#1a0505] border-red-900/20' : ''
                }`}
              >
                <div className="flex justify-between items-center gap-6">
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {notice.is_important && (
                        <span className="bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase italic animate-pulse">Important</span>
                      )}
                      <span className="text-gray-600 font-black text-[9px] uppercase italic tracking-widest">{new Date(notice.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className={`text-xl md:text-2xl font-black italic tracking-tight group-hover:text-red-500 transition-colors truncate ${notice.is_important ? 'text-white' : 'text-gray-400'}`}>
                      {notice.title}
                    </h3>
                  </div>
                  <div className="shrink-0 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-red-600 transition-all duration-300">
                    <span className="text-white text-xl">→</span>
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
