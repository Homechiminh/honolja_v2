import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import type { User } from '../types';

interface MyPageProps {
  currentUser: User | null;
}

const MyPage: React.FC<MyPageProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [newNickname, setNewNickname] = useState(currentUser?.nickname || '');
  const [loading, setLoading] = useState(false);

  // 1. 이름(닉네임) 수정 로직
  const handleUpdateNickname = async () => {
    if (!currentUser || !newNickname.trim()) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ nickname: newNickname })
        .eq('id', currentUser.id);

      if (error) throw error;
      alert('닉네임이 성공적으로 변경되었습니다!');
      setIsEditing(false);
      window.location.reload(); // 변경사항 즉시 반영
    } catch (err: any) {
      alert(`수정 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 2. 로그아웃 로직 (MyPage 내부 버튼용)
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/');
      window.location.reload();
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* 프로필 카드 섹션 */}
        <div className="bg-[#0f0f0f] rounded-[2.5rem] p-10 border border-white/5 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-1">
            <span className="bg-red-600 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase italic tracking-tighter shadow-lg">System Admin</span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* 아바타 영역 */}
            <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-[#1a1a1a] to-black border-2 border-red-600/30 flex items-center justify-center text-5xl font-black italic text-white shadow-2xl relative group">
              {currentUser.nickname[0].toUpperCase()}
              <div className="absolute inset-0 bg-red-600/10 rounded-[2.5rem] animate-pulse"></div>
            </div>

            {/* 유저 정보 및 수정 UI */}
            <div className="flex-grow text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                {isEditing ? (
                  <div className="flex items-center gap-3">
                    <input 
                      value={newNickname} 
                      onChange={(e) => setNewNickname(e.target.value)}
                      className="bg-black border-2 border-red-600/50 rounded-xl px-4 py-2 text-xl font-black text-white outline-none focus:ring-4 ring-red-600/20 transition-all"
                      autoFocus
                    />
                    <button onClick={handleUpdateNickname} disabled={loading} className="text-emerald-500 font-black text-sm hover:text-emerald-400 transition-colors uppercase">Save</button>
                    <button onClick={() => setIsEditing(false)} className="text-gray-500 font-black text-sm hover:text-gray-400 transition-colors uppercase">Cancel</button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                      {currentUser.nickname} <span className="text-gray-500 not-italic lowercase font-bold text-lg">님</span>
                    </h2>
                    <button onClick={() => setIsEditing(true)} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-red-600/20 border border-white/10 transition-all group">
                      <span className="text-sm group-hover:scale-125 transition-transform">✏️</span>
                    </button>
                  </>
                )}
              </div>
              <p className="text-gray-500 font-bold mb-8 italic tracking-tight">{currentUser.email}</p>
              
              <div className="flex items-center justify-center md:justify-start gap-3">
                <button onClick={() => navigate('/admin')} className="px-6 py-3 bg-red-600 text-white rounded-xl text-[11px] font-black hover:bg-red-700 transition-all uppercase italic shadow-lg shadow-red-600/20 active:scale-95">Admin Dashboard</button>
                <button onClick={handleLogout} className="px-6 py-3 bg-white/5 text-gray-400 border border-white/10 rounded-xl text-[11px] font-black hover:bg-white/10 transition-all uppercase italic active:scale-95">Logout</button>
              </div>
            </div>

            {/* 포인트 섹션 */}
            <div className="bg-black/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 min-w-[220px] text-center shadow-inner relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600/50 to-transparent"></div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">My Points</p>
              <h4 className="text-4xl font-black text-red-600 italic tracking-tighter">
                {currentUser.points?.toLocaleString()} <span className="text-xs text-white ml-1 not-italic font-bold">P</span>
              </h4>
            </div>
          </div>
        </div>

        {/* 활동 통계 섹션 (기존 UI 구현) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0f0f0f] p-8 rounded-[2rem] border border-white/5 text-center group hover:border-red-600/30 transition-all">
            <p className="text-gray-500 text-[10px] font-black uppercase mb-2 tracking-widest">작성한 게시글</p>
            <p className="text-3xl font-black text-white italic group-hover:text-red-500 transition-colors">0</p>
          </div>
          <div className="bg-[#0f0f0f] p-8 rounded-[2rem] border border-white/5 text-center group hover:border-red-600/30 transition-all">
            <p className="text-gray-500 text-[10px] font-black uppercase mb-2 tracking-widest">작성한 댓글</p>
            <p className="text-3xl font-black text-white italic group-hover:text-red-500 transition-colors">0</p>
          </div>
          <div className="bg-[#0f0f0f] p-8 rounded-[2rem] border border-white/5 text-center group hover:border-red-600/30 transition-all">
            <p className="text-gray-500 text-[10px] font-black uppercase mb-2 tracking-widest">받은 추천수</p>
            <p className="text-3xl font-black text-white italic group-hover:text-red-500 transition-colors">0</p>
          </div>
        </div>

        {/* 내 활동 내역 탭 영역 */}
        <div className="bg-[#0f0f0f] rounded-[2rem] border border-white/5 overflow-hidden">
          <div className="flex border-b border-white/5">
            <button className="flex-1 py-6 bg-red-600 text-white font-black italic uppercase tracking-tighter">📣 내 활동 내역</button>
            <button className="flex-1 py-6 bg-transparent text-gray-500 font-black italic uppercase tracking-tighter hover:text-white transition-colors">📋 포인트 이용내역</button>
          </div>
          <div className="p-20 text-center">
            <p className="text-gray-600 font-bold italic tracking-tight">활동 내역이 존재하지 않습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
