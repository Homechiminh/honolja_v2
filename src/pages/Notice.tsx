import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { useFetchGuard } from '../hooks/useFetchGuard';

const Notice: React.FC = () => {
  const navigate = useNavigate();
  
  // 1. 전역 인증 상태 구독
  const { currentUser, loading: authLoading } = useAuth();
  
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * 🔴 [방탄 fetch] 공지사항 아카이브 로드
   * 어떤 네트워크 에러(406 등)가 발생해도 finally 블록이 로딩 스피너를 해제합니다.
   */
  const fetchNotices = async () => {
    setLoading(true); // 로딩 시작
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('is_important', { ascending: false }) // 중요 공지 상단 고정
        .order('created_at', { ascending: false });

      if (error) {
        // 🔴 서버 거절 또는 406 에러 발생 시 catch로 즉시 이동
        throw error;
      }

      setNotices(data || []);
    } catch (err: any) {
      console.error('HQ Intelligence Sync Failed (406 등):', err.message);
      // 에러 발생 시 리스트 초기화로 ghost 데이터 방지
      setNotices([]); 
    } finally {
      // 🔴 핵심: 성공하든 실패하든 무조건 로딩 상태 해제
      setLoading(false);
    }
  };

  /**
   * 🔴 [데이터 가드 적용] 
   * 인증 로딩이 끝난 뒤 안전하게 본부 데이터베이스와 동기화합니다.
   */
  useFetchGuard(fetchNotices, []);

  // 2. 전체 로딩 처리 (인증 확인 중일 때 블랙아웃 방지)
  if (authLoading || (loading && notices.length === 0)) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-red-600 font-black animate-pulse uppercase tracking-[0.3em] text-xl italic">
        Syncing HQ Database...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans selection:bg-red-600/30">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
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
              + New Announcement
            </button>
          )}
        </header>

        <div className="space-y-6">
          {notices.length === 0 ? (
            <div className="py-32 text-center bg-[#0f0f0f] rounded-[3rem] border border-dashed border-white/5 animate-in fade-in duration-700">
              <p className="text-gray-600 font-black italic uppercase tracking-widest">No Bulletins Issued Yet.</p>
            </div>
          ) : (
            notices.map((notice) => (
              <div 
                key={notice.id}
                className={`group relative bg-[#0f0f0f] rounded-[2.5rem] border transition-all duration-500 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 ${
                  notice.is_important ? 'border-red-600/30 ring-1 ring-red-600/10' : 'border-white/5 hover:border-red-600/20'
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
                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-red-600 group-hover:rotate-45 transition-all duration-500 shadow-xl cursor-pointer">
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
