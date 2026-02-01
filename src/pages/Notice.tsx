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

  // 🔴 [데이터 가드] 인증 확인 후 공지사항 데이터를 호출합니다.
  useFetchGuard(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('is_important', { ascending: false }) // 중요 공지 우선
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotices(data || []);
    } catch (err) {
      console.error('Notice fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  if (authLoading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-red-600 font-black animate-pulse tracking-widest uppercase italic">Decrypting HQ Intel...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans selection:bg-red-600/30">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
              Official <span className="text-red-600">Notice</span>
            </h2>
            <p className="text-gray-500 font-bold uppercase text-[10px] mt-4 italic tracking-[0.3em]">호놀자 커뮤니티 가이드 및 중요 공지</p>
          </div>
          {currentUser?.role === 'ADMIN' && (
            <button 
              onClick={() => navigate('/admin/notice/create')}
              className="px-8 py-3 bg-white text-black font-black text-xs rounded-xl uppercase italic hover:bg-red-600 hover:text-white transition-all shadow-xl"
            >
              New Announcement
            </button>
          )}
        </header>

        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center text-gray-700 font-black italic animate-pulse">SYNCING HQ DATA...</div>
          ) : notices.length === 0 ? (
            <div className="py-32 text-center bg-[#0f0f0f] rounded-[3rem] border border-dashed border-white/5">
              <p className="text-gray-600 font-black italic uppercase tracking-widest">No Bulletins Issued Yet.</p>
            </div>
          ) : (
            notices.map((notice) => (
              <div 
                key={notice.id}
                className={`group relative bg-[#0f0f0f] rounded-[2rem] border transition-all duration-500 overflow-hidden shadow-2xl ${
                  notice.is_important ? 'border-red-600/30' : 'border-white/5 hover:border-red-600/20'
                }`}
              >
                <div className="p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-grow space-y-3">
                    <div className="flex items-center gap-3">
                      {notice.is_important && (
                        <span className="bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase italic animate-pulse">Important</span>
                      )}
                      <span className="text-gray-600 font-black text-[10px] uppercase italic tracking-widest">
                        {new Date(notice.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className={`text-2xl font-black italic tracking-tight group-hover:text-red-500 transition-colors ${notice.is_important ? 'text-white' : 'text-gray-300'}`}>
                      {notice.title}
                    </h3>
                    <p className="text-gray-500 text-sm font-medium line-clamp-1 opacity-70 italic">{notice.content}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {currentUser?.role === 'ADMIN' && (
                      <button 
                        onClick={() => navigate(`/admin/notice/edit/${notice.id}`)}
                        className="p-3 bg-white/5 rounded-xl hover:bg-red-600 text-gray-500 hover:text-white transition-all text-xs font-black uppercase italic"
                      >
                        Modify
                      </button>
                    )}
                    <button className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-red-600 group-hover:rotate-45 transition-all">
                      <span className="text-white text-xl">→</span>
                    </button>
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
