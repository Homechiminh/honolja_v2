import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import type { User } from '../types';

interface MyPageProps {
  currentUser: User | null;
}

const MyPage: React.FC<MyPageProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'activity' | 'points'>('activity');
  const [isEditing, setIsEditing] = useState(false);
  const [newNickname, setNewNickname] = useState(currentUser?.nickname || '');
  const [loading, setLoading] = useState(false);
  
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [pointHistory, setPointHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchMyData = async () => {
      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', currentUser.id)
        .order('created_at', { ascending: false });
      if (posts) setMyPosts(posts);

      const { data: points } = await supabase
        .from('point_history')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
      if (points) setPointHistory(points);
    };

    fetchMyData();
  }, [currentUser]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${currentUser.id}/${Math.random()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;
      alert('프로필 사진이 변경되었습니다!');
      window.location.reload();
    } catch (err: any) {
      alert(`업로드 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNickname = async () => {
    if (!currentUser || !newNickname.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({ nickname: newNickname }).eq('id', currentUser.id);
      if (error) throw error;
      alert('닉네임이 변경되었습니다!');
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* 프로필 카드 */}
        <div className="bg-[#0f0f0f] rounded-[2.5rem] p-10 border border-white/5 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* 아바타 영역 */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-[#1a1a1a] to-black border-2 border-red-600/30 flex items-center justify-center overflow-hidden shadow-2xl">
                {/* 🔴 types.ts 수정 후 avatar_url 접근 가능 */}
                {currentUser.avatar_url ? (
                  <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl font-black italic">{currentUser.nickname?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-[2.5rem]">
                <span className="text-[10px] font-black uppercase">Change</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={loading} />
              </label>
            </div>

            <div className="flex-grow text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input 
                      value={newNickname} 
                      onChange={(e) => setNewNickname(e.target.value)}
                      className="bg-black border border-red-600/50 rounded-xl px-4 py-2 text-xl font-black outline-none"
                      autoFocus
                    />
                    <button onClick={handleUpdateNickname} className="text-emerald-500 font-bold">저장</button>
                    <button onClick={() => setIsEditing(false)} className="text-gray-500 font-bold">취소</button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">{currentUser.nickname}님</h2>
                    <button onClick={() => setIsEditing(true)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">✏️</button>
                  </>
                )}
              </div>
              <p className="text-gray-500 font-bold mb-8 italic">{currentUser.email}</p>
              <div className="flex gap-3 justify-center md:justify-start">
                <button onClick={() => navigate('/admin')} className="px-6 py-2.5 bg-red-600 rounded-xl text-xs font-black uppercase italic">Admin</button>
                <button onClick={() => { supabase.auth.signOut(); navigate('/'); window.location.reload(); }} className="px-6 py-2.5 bg-white/5 text-gray-400 rounded-xl text-xs font-black uppercase italic border border-white/5">Logout</button>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 min-w-[200px] text-center shadow-inner">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">My Points</p>
              <h4 className="text-3xl font-black text-red-600 italic tracking-tighter">
                {currentUser.points?.toLocaleString()} <span className="text-xs text-white ml-1 font-bold">P</span>
              </h4>
            </div>
          </div>
        </div>

        {/* 탭 및 내역 (이전 코드와 동일) */}
        <div className="bg-[#0f0f0f] rounded-[2rem] border border-white/5 overflow-hidden">
          <div className="flex border-b border-white/5">
            <button onClick={() => setActiveTab('activity')} className={`flex-1 py-6 font-black italic uppercase transition-all ${activeTab === 'activity' ? 'bg-red-600 text-white' : 'text-gray-500'}`}>📣 내 활동 내역</button>
            <button onClick={() => setActiveTab('points')} className={`flex-1 py-6 font-black italic uppercase transition-all ${activeTab === 'points' ? 'bg-red-600 text-white' : 'text-gray-500'}`}>📋 포인트 이용내역</button>
          </div>
          <div className="p-10">
            {/* 리스트 렌더링 로직 생략 */}
            <p className="text-center text-gray-600 font-bold italic py-10">내역을 불러오는 중입니다...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
