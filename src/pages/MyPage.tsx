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

  // 🔴 프로필 이미지 업로드 함수
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${currentUser.id}/${Math.random()}.${fileExt}`;

    try {
      // 1. Storage에 업로드
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. 공개 URL 가져오기
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      // 3. Profiles 테이블 업데이트
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;
      alert('프로필 사진이 변경되었습니다!');
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
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
      setIsEditing(false);
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-[#0f0f0f] rounded-[2.5rem] p-10 border border-white/5 relative shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* 🔴 아바타 클릭 시 파일 업로드 */}
            <div className="relative group cursor-pointer">
              <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-2 border-red-600/30 shadow-2xl">
                {currentUser.avatar_url ? (
                  <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-4xl font-black text-white italic">
                    {currentUser.nickname[0].toUpperCase()}
                  </div>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem] cursor-pointer">
                <span className="text-white text-xs font-bold">변경</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={loading} />
              </label>
            </div>

            <div className="flex-grow text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                {isEditing ? (
                  <div className="flex items-center gap-3">
                    <input value={newNickname} onChange={(e) => setNewNickname(e.target.value)} className="bg-black border-2 border-red-600/50 rounded-xl px-4 py-2 text-white outline-none" autoFocus />
                    <button onClick={handleUpdateNickname} className="text-emerald-500 font-black text-sm uppercase">Save</button>
                    <button onClick={() => setIsEditing(false)} className="text-gray-500 font-black text-sm uppercase">Cancel</button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{currentUser.nickname}님</h2>
                    <button onClick={() => setIsEditing(true)} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">✏️</button>
                  </>
                )}
              </div>
              <p className="text-gray-500 font-bold mb-8 italic">{currentUser.email}</p>
              <div className="flex gap-3 justify-center md:justify-start">
                <button onClick={() => navigate('/admin')} className="px-6 py-3 bg-red-600 text-white rounded-xl text-[11px] font-black uppercase italic shadow-lg">Admin</button>
                <button onClick={() => { supabase.auth.signOut(); navigate('/'); window.location.reload(); }} className="px-6 py-3 bg-white/5 text-gray-400 border border-white/10 rounded-xl text-[11px] font-black uppercase italic">Logout</button>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 min-w-[220px] text-center shadow-inner">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">My Points</p>
              <h4 className="text-4xl font-black text-red-600 italic tracking-tighter">
                {currentUser.points?.toLocaleString()} <span className="text-xs text-white ml-1 font-bold">P</span>
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
