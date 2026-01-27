import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  const [activeTab, setActiveTab] = useState<'activity' | 'points'>('activity');
  
  // 데이터 상태 관리
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [pointHistory, setPointHistory] = useState<any[]>([]);

  // 데이터 페칭 (활동 내역 및 포인트 내역)
  useEffect(() => {
    if (!currentUser) return;

    const fetchMyData = async () => {
      // 게시글 가져오기
      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', currentUser.id)
        .order('created_at', { ascending: false });
      if (posts) setMyPosts(posts);

      // 포인트 내역 가져오기 (테이블 생성 후 정상 작동)
      const { data: points } = await supabase
        .from('point_history')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
      if (points) setPointHistory(points);
    };

    fetchMyData();
  }, [currentUser]);

  // 1. 프로필 사진 업로드 로직
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${currentUser.id}/${Math.random()}.${fileExt}`;

    try {
      // Storage 업로드
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // URL 가져오기
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      // DB 업데이트
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;
      
      alert('프로필 사진이 성공적으로 변경되었습니다!');
      window.location.reload(); 
    } catch (err: any) {
      alert(`업로드 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 2. 닉네임 수정 로직
  const handleUpdateNickname = async () => {
    if (!currentUser || !newNickname.trim()) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ nickname: newNickname })
        .eq('id', currentUser.id);

      if (error) throw error;
      alert('닉네임이 변경되었습니다!');
      setIsEditing(false);
      window.location.reload();
    } catch (err: any) {
      alert(`수정 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 3. 로그아웃 로직
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/');
      window.location.reload();
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* 상단 프로필 카드 */}
        <div className="bg-[#0f0f0f] rounded-[2.5rem] p-10 border border-white/5 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-1">
            <span className="bg-red-600 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase italic tracking-tighter">System Admin</span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* 아바타 업로드 영역 */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-[#1a1a1a] to-black border-2 border-red-600/30 flex items-center justify-center overflow-hidden shadow-2xl">
                {currentUser.avatar_url ? (
                  <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl font-black italic">{currentUser.nickname[0].toUpperCase()}</span>
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
                      className="bg-black border border-red-600/50 rounded-xl px-4 py-2 text-xl font-black outline-none focus:ring-2 ring-red-600/20"
                      autoFocus
                    />
                    <button onClick={handleUpdateNickname} disabled={loading} className="text-emerald-500 font-bold text-sm">저장</button>
                    <button onClick={() => setIsEditing(false)} className="text-gray-500 font-bold text-sm">취소</button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                      {currentUser.nickname} <span className="text-gray-500 not-italic lowercase text-lg">님</span>
                    </h2>
                    <button onClick={() => setIsEditing(true)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10">
                      <span className="text-xs">✏️</span>
                    </button>
                  </>
                )}
              </div>
              <p className="text-gray-500 font-bold mb-8 italic">{currentUser.email}</p>
              
              <div className="flex items-center justify-center md:justify-start gap-3">
                <button onClick={() => navigate('/admin')} className="px-6 py-2.5 bg-red-600 rounded-xl text-xs font-black uppercase italic shadow-lg shadow-red-600/20">Admin Dashboard</button>
                <button onClick={handleLogout} className="px-6 py-2.5 bg-white/5 text-gray-400 rounded-xl text-xs font-black uppercase italic border border-white/5">Logout</button>
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

        {/* 활동 통계 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0f0f0f] p-8 rounded-[2rem] border border-white/5 text-center">
            <p className="text-gray-500 text-[10px] font-black uppercase mb-1 tracking-widest">작성한 게시글</p>
            <p className="text-3xl font-black italic">{myPosts.length}</p>
          </div>
          <div className="bg-[#0f0f0f] p-8 rounded-[2rem] border border-white/5 text-center">
            <p className="text-gray-500 text-[10px] font-black uppercase mb-1 tracking-widest">작성한 댓글</p>
            <p className="text-3xl font-black italic">0</p>
          </div>
          <div className="bg-[#0f0f0f] p-8 rounded-[2rem] border border-white/5 text-center">
            <p className="text-gray-500 text-[10px] font-black uppercase mb-1 tracking-widest">받은 추천수</p>
            <p className="text-3xl font-black italic">0</p>
          </div>
        </div>

        {/* 활동 내역 탭 섹션 */}
        <div className="bg-[#0f0f0f] rounded-[2rem] border border-white/5 overflow-hidden">
          <div className="flex border-b border-white/5">
            <button 
              onClick={() => setActiveTab('activity')}
              className={`flex-1 py-6 font-black italic uppercase transition-all ${activeTab === 'activity' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              📣 내 활동 내역
            </button>
            <button 
              onClick={() => setActiveTab('points')}
              className={`flex-1 py-6 font-black italic uppercase transition-all ${activeTab === 'points' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              📋 포인트 이용내역
            </button>
          </div>

          <div className="p-10">
            {activeTab === 'activity' ? (
              myPosts.length > 0 ? (
                <div className="space-y-3">
                  {myPosts.map(post => (
                    <Link key={post.id} to={`/post/${post.id}`} className="block p-4 bg-white/5 rounded-xl border border-white/5 hover:border-red-600/50 transition-all group">
                      <div className="flex justify-between items-center">
                        <span className="font-bold group-hover:text-red-500 transition-colors italic">📝 {post.title}</span>
                        <span className="text-[10px] text-gray-500">{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600 font-bold italic py-10">활동 내역이 없습니다.</p>
              )
            ) : (
              pointHistory.length > 0 ? (
                <div className="space-y-3">
                  {pointHistory.map(item => (
                    <div key={item.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center">
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
                <p className="text-center text-gray-600 font-bold italic py-10">포인트 이용 내역이 없습니다.</p>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
