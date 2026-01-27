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
  
  // 🔴 myPosts와 pointHistory 사용됨
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [pointHistory, setPointHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchMyData = async () => {
      // 1. 게시글 가져오기
      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', currentUser.id)
        .order('created_at', { ascending: false });
      if (posts) setMyPosts(posts);

      // 2. 포인트 내역 가져오기
      const { data: points } = await supabase
        .from('point_history')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
      if (points) setPointHistory(points);
    };

    fetchMyData();
  }, [currentUser]);

  // 프로필 사진 업로드
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${currentUser.id}/${Math.random()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', currentUser.id);
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 닉네임 수정
  const handleUpdateNickname = async () => {
    if (!currentUser || !newNickname.trim()) return;
    setLoading(true);
    try {
      await supabase.from('profiles').update({ nickname: newNickname }).eq('id', currentUser.id);
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
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* 프로필 카드 섹션 */}
        <div className="bg-[#0f0f0f] rounded-[2.5rem] p-10 border border-white/5 relative shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-[#1a1a1a] to-black border-2 border-red-600/30 flex items-center justify-center overflow-hidden shadow-2xl">
                {currentUser.avatar_url ? (
                  <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl font-black italic">{currentUser.nickname?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-[2.5rem]">
                <span className="text-[10px] font-black uppercase tracking-tighter">Change</span>
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
                    <button onClick={handleUpdateNickname} className="text-emerald-500 font-bold uppercase text-xs">Save</button>
                    <button onClick={() => setIsEditing(false)} className="text-gray-500 font-bold uppercase text-xs">Cancel</button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">{currentUser.nickname}님</h2>
                    <button onClick={() => setIsEditing(true)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">✏️</button>
                  </>
                )}
              </div>
              <p className="text-gray-500 font-bold mb-8 italic">{currentUser.email}</p>
              <div className="flex gap-3 justify-center md:justify-start">
                <button onClick={() => navigate('/admin')} className="px-6 py-2.5 bg-red-600 rounded-xl text-[10px] font-black uppercase italic shadow-lg">Admin Dashboard</button>
                <button onClick={() => { supabase.auth.signOut(); navigate('/'); window.location.reload(); }} className="px-6 py-2.5 bg-white/5 text-gray-400 border border-white/10 rounded-xl text-[10px] font-black uppercase italic">Logout</button>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 min-w-[200px] text-center shadow-inner">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">My Points</p>
              <h4 className="text-3xl font-black text-red-600 italic tracking-tighter">
                {currentUser.points?.toLocaleString()} <span className="text-xs text-white ml-1">P</span>
              </h4>
            </div>
          </div>
        </div>

        {/* 활동 통계 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#0f0f0f] p-8 rounded-[2rem] border border-white/5 text-center">
            <p className="text-gray-500 text-[9px] font-black uppercase mb-1 tracking-widest">작성글</p>
            <p className="text-3xl font-black italic">{myPosts.length}</p>
          </div>
          <div className="bg-[#0f0f0f] p-8 rounded-[2rem] border border-white/5 text-center"><p className="text-gray-500 text-[9px] font-black uppercase mb-1 tracking-widest">댓글</p><p className="text-3xl font-black italic">0</p></div>
          <div className="bg-[#0f0f0f] p-8 rounded-[2rem] border border-white/5 text-center"><p className="text-gray-500 text-[9px] font-black uppercase mb-1 tracking-widest">추천</p><p className="text-3xl font-black italic">0</p></div>
        </div>

        {/* 🔴 탭 및 리스트 렌더링 (에러 해결 핵심 구간) */}
        <div className="bg-[#0f0f0f] rounded-[2rem] border border-white/5 overflow-hidden">
          <div className="flex border-b border-white/5">
            <button onClick={() => setActiveTab('activity')} className={`flex-1 py-6 font-black italic uppercase transition-all ${activeTab === 'activity' ? 'bg-red-600 text-white' : 'text-gray-500'}`}>📣 내 활동 내역</button>
            <button onClick={() => setActiveTab('points')} className={`flex-1 py-6 font-black italic uppercase transition-all ${activeTab === 'points' ? 'bg-red-600 text-white' : 'text-gray-500'}`}>📋 포인트 이용내역</button>
          </div>

          <div className="p-8">
            {activeTab === 'activity' ? (
              myPosts.length > 0 ? (
                <div className="space-y-3">
                  {myPosts.map(post => (
                    <Link key={post.id} to={`/post/${post.id}`} className="block p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-red-600/50 transition-all group">
                      <div className="flex justify-between items-center">
                        <span className="font-bold group-hover:text-red-500 transition-colors italic">📝 {post.title}</span>
                        <span className="text-[10px] text-gray-500">{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600 font-bold italic py-20">활동 내역이 없습니다.</p>
              )
            ) : (
              pointHistory.length > 0 ? (
                <div className="space-y-3">
                  {pointHistory.map(item => (
                    <div key={item.id} className="p-5 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center">
                      <div>
                        <span className="font-bold block italic">{item.reason}</span>
                        <span className="text-[10px] text-gray-500">{new Date(item.created_at).toLocaleString()}</span>
                      </div>
                      <span className={`font-black italic ${item.amount > 0 ? 'text-emerald-500' : 'text-red-600'}`}>
                        {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()} P
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600 font-bold italic py-20">포인트 이용 내역이 없습니다.</p>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
