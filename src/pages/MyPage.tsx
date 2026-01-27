import React, { useState, useEffect } from 'react';
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
        <div className="bg-[#0f0f0f] rounded-[2.5rem] p-10 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-1">
            <span className="bg-red-600 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase italic tracking-tighter">System Admin</span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* 아바타 */}
            <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-[#1a1a1a] to-black border-2 border-red-600/30 flex items-center justify-center text-5xl font-black italic text-white shadow-2xl">
              {currentUser.nickname[0].toUpperCase()}
            </div>

            {/* 유저 정보 및 수정 UI */}
            <div className="flex-grow text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input 
                      value={newNickname} 
                      onChange={(e) => setNewNickname(e.target.value)}
                      className="bg-black border border-red-600/50 rounded-xl px-4 py-2 text-xl font-black text-white outline-none focus:ring-2 ring-red-600/20"
                      autoFocus
                    />
                    <button onClick={handleUpdateNickname} disabled={loading} className="text-emerald-500 font-bold text-sm hover:text-emerald-400">저장</button>
                    <button onClick={() => setIsEditing(false)} className="text-gray-500 font-bold text-sm hover:text-gray-400">취소</button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                      {currentUser.nickname} <span className="text-gray-500 not-italic lowercase">님</span>
                    </h2>
                    <button onClick={() => setIsEditing(true)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                      <span className="text-xs">✏️</span>
                    </button>
                  </>
                )}
              </div>
              <p className="text-gray-500 font-bold mb-8 italic">{currentUser.email}</p>
              
              <div className="flex items-center justify-center md:justify-start gap-3">
                <button onClick={() => navigate('/admin')} className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-xs font-black hover:bg-red-700 transition-all uppercase italic">Admin Dashboard</button>
                <button onClick={handleLogout} className="px-6 py-2.5 bg-white/5 text-gray-400 rounded-xl text-xs font-black hover:bg-white/10 transition-all uppercase italic">Logout</button>
              </div>
            </div>

            {/* 포인트 섹션 */}
            <div className="bg-black/40 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 min-w-[200px] text-center shadow-inner">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">My Points</p>
              <h4 className="text-3xl font-black text-red-600 italic tracking-tighter">
                {currentUser.points?.toLocaleString()} <span className="text-xs text-white ml-1">P</span>
              </h4>
            </div>
          </div>
        </div>

        {/* 하단 활동 내역 영역 (기존 UI 유지) */}
        <div className="grid grid-cols-3 gap-4">
           {/* ... 게시글/댓글 등 통계 박스 ... */}
        </div>
      </div>
    </div>
  );
};

export default MyPage;
