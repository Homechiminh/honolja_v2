import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';

const NoticeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, initialized } = useAuth();
  const [notice, setNotice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 데이터 패칭 로직 최적화
  const fetchNotice = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setNotice(data);
      }
    } catch (err: any) {
      console.error('Notice Fetch Error:', err.message);
      navigate('/notice');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  // 페이지 진입 시 데이터 호출 (initialized 대기 로직 포함)
  useEffect(() => {
    if (initialized) {
      fetchNotice();
    }
  }, [fetchNotice, initialized]);

  if (!initialized || loading || !notice) return (
    <div className="min-h-screen bg-black flex items-center justify-center font-black animate-pulse text-white uppercase italic tracking-widest">
      Decrypting HQ Intel...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 font-sans selection:bg-red-600/30">
      <Helmet><title>호놀자 | {notice.title}</title></Helmet>

      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
        <div className="flex justify-between items-center px-4">
          <button onClick={() => navigate('/notice')} className="text-gray-500 hover:text-white font-black uppercase italic text-xs tracking-[0.2em] transition-all">
            ← 목록으로 돌아가기
          </button>
          
          {currentUser?.role === 'ADMIN' && (
            <button onClick={() => navigate(`/notice/edit/${id}`)} className="px-6 py-2.5 bg-red-600/10 border border-red-600/30 rounded-xl text-red-500 hover:bg-red-600 hover:text-white font-black text-[10px] uppercase italic transition-all shadow-lg">
              Edit Record
            </button>
          )}
        </div>

        <div className="bg-[#0f0f0f] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
          <header className="p-10 md:p-14 border-b border-white/5">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-4 py-1 bg-red-600 text-white text-[10px] font-black rounded-full uppercase italic tracking-widest shadow-lg shadow-red-900/20">OFFICIAL BULLETIN</span>
              <span className="text-gray-500 font-black text-[10px] uppercase italic tracking-[0.2em]">{new Date(notice.created_at).toLocaleDateString()}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter leading-tight break-keep uppercase">{notice.title}</h1>
          </header>
          
          <article className="p-10 md:p-14 text-slate-100 text-lg md:text-xl leading-[1.8] whitespace-pre-wrap font-medium italic">
            {notice.content}
          </article>
        </div>

        <div className="pt-10 text-center border-t border-white/5">
           <p className="text-gray-700 text-[9px] font-black uppercase tracking-[0.4em] italic opacity-50">End of Official Document</p>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetail;
