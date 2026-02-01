import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { supabase } from '../supabase';
import { LEVEL_NAMES } from '../types';
import type { User } from '../types';

interface MyPageProps {
  currentUser: User | null;
}

const MyPage: React.FC<MyPageProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'activity' | 'points' | 'coupons'>('activity');
  const [isEditing, setIsEditing] = useState(false);
  const [newNickname, setNewNickname] = useState(currentUser?.nickname || '');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true); // 🔴 데이터 전용 로딩 상태 추가
  
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [pointHistory, setPointHistory] = useState<any[]>([]);
  const [myCoupons, setMyCoupons] = useState<any[]>([]);

  // 🔴 탭 전환 시 데이터 로드 안정화: currentUser.id가 있을 때 즉시 호출
  useEffect(() => {
    if (currentUser?.id) {
      fetchMyData();
    }
  }, [currentUser?.id]);

  const fetchMyData = async () => {
    if (!currentUser?.id) return;
    setDataLoading(true);
    try {
      // 1. 내가 쓴 게시글
      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', currentUser.id)
        .order('created_at', { ascending: false });
      if (posts) setMyPosts(posts);

      // 2. 포인트 내역
      const { data: points } = await supabase
        .from('point_history')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
      if (points) setPointHistory(points);

      // 3. 사용 가능한 쿠폰
      const { data: coupons } = await supabase
        .from('coupons')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('is_used', false)
        .order('created_at', { ascending: false });
      if (coupons) setMyCoupons(coupons);
    } catch (err) {
      console.error('MyPage data fetch error:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    setLoading(true);
    const filePath = `avatars/${currentUser.id}_${Date.now()}`;

    try {
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', currentUser.id);
      
      if (updateError) throw updateError;
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
      setIsEditing(false);
      window.location.reload();
    } catch (err: any) { 
      alert(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  // 🔴 PrivateRoute가 처리하므로 null일 확률은 낮지만 타입 안전성을 위해 유지
  if (!currentUser) return null;

  const nextLevelCriteria = { 2: { points: 100, reviews: 1 }, 3: { points: 300, reviews: 3 }, 4: { points: 1000, reviews: 8 } };
  const currentCriteria = (nextLevelCriteria as any)[currentUser.level + 1] || null;

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* 상단 프로필 카드 (디자인 유지) */}
        <div className="bg-[#0f0f0f] rounded-[3rem] p-10 md:p-14 border border-white/5 relative shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="relative group w-40 h-40">
              <div className="w-full h-full rounded-[3rem] bg-gradient-to-br from-[#1a1a1a] to-black border-2 border-white/10 flex items-center justify-center overflow-hidden">
                {currentUser.avatar_url ? (
                  <img src={currentUser.avatar_url} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <span className="text-6xl text-red-600 italic font-black">{currentUser.nickname?.[0]}</span>
                )}
              </div>
              <label className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-[3rem]">
                <span className="text-[10px] font-black uppercase">Edit</span>
                <input type="file" className="hidden" onChange={handleAvatarUpload} disabled={loading} />
              </label>
            </div>

            <div className="flex-grow text-center md:text-left">
              <div className="inline-block bg-red-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase italic mb-4">
                LV.{currentUser.level} {LEVEL_NAMES[currentUser.level]}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
                {isEditing ? (
                  <div className="flex items-center gap-3">
                    <input value={newNickname} onChange={(e) => setNewNickname(e.target.value)} className="bg-black border-2 border-red-600/50 rounded-2xl px-5 py-2 text-2xl font-black w-48 outline-none" />
                    <button onClick={handleUpdateNickname} disabled={loading} className="bg-emerald-600 p-2 rounded-xl">✔️</button>
                    <button onClick={() => setIsEditing(false)} className="bg-white/5 p-2 rounded-xl">❌</button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-5xl font-black italic tracking-tighter uppercase">{currentUser.nickname}님</h2>
                    <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-white transition-colors">✏️</button>
                  </>
                )}
              </div>
              <div className="flex gap-4 justify-center md:justify-start mt-6">
                <div className="bg-black/50 px-6 py-3 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-black text-gray-500 uppercase">Points</p>
                  <p className="text-xl font-black text-red-600 italic">{currentUser.points?.toLocaleString()}P</p>
                </div>
                <div className="bg-black/50 px-6 py-3 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-black text-gray-500 uppercase">Reviews</p>
                  <p className="text-xl font-black text-emerald-500 italic">{currentUser.review_count}건</p>
                </div>
              </div>
            </div>

            {/* 등급 가이드 (Criteria) */}
            {currentCriteria && (
              <div className="w-full md:w-64 bg-white/5 p-6 rounded-[2rem] border border-white/5 shadow-inner">
                <p className="text-[10px] font-black text-yellow-500 uppercase mb-4 tracking-widest">Next: {LEVEL_NAMES[currentUser.level + 1]}</p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] mb-1 font-bold"><span>Points</span><span>{currentUser.points}/{currentCriteria.points}</span></div>
                    <div className="h-1.5 bg-black rounded-full overflow-hidden">
                      <div className="bg-red-600 h-full transition-all duration-1000" style={{ width: `${Math.min(100, (currentUser.points/currentCriteria.points)*100)}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] mb-1 font-bold"><span>Reviews</span><span>{currentUser.review_count}/{currentCriteria.reviews}</span></div>
                    <div className="h-1.5 bg-black rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full transition-all duration-1000" style={{ width: `${Math.min(100, (currentUser.review_count/currentCriteria.reviews)*100)}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 활동 탭 섹션 (디자인 유지) */}
        <div className="bg-[#0f0f0f] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="flex bg-white/5 p-2 gap-2">
            {['activity', 'points', 'coupons'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-5 rounded-2xl font-black uppercase transition-all ${activeTab === tab ? 'bg-red-600 text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}>
                {tab === 'activity' ? '📝 내 게시글' : tab === 'points' ? '📋 포인트 내역' : '🎟️ 나의 쿠폰함'}
              </button>
            ))}
          </div>

          <div className="p-10 min-h-[400px]">
            {dataLoading ? (
              <div className="flex items-center justify-center h-[300px] text-gray-700 font-black italic animate-pulse">LOADING DATA...</div>
            ) : (
              <>
                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    {myPosts.length > 0 ? myPosts.map(post => (
                      <Link key={post.id} to={`/post/${post.id}`} className="flex justify-between items-center p-6 bg-white/5 rounded-[1.5rem] border border-white/5 hover:border-red-600/50 transition-all group">
                        <div className="flex items-center gap-4">
                          <span className="text-red-600 font-black text-[10px] opacity-50 italic">#{post.category.toUpperCase()}</span>
                          <span className="text-lg font-bold group-hover:text-red-500 transition-colors italic">{post.title}</span>
                        </div>
                        <span className="text-[11px] text-gray-600 font-bold">{new Date(post.created_at).toLocaleDateString()}</span>
                      </Link>
                    )) : (
                      <p className="text-center text-gray-600 italic py-20 font-black uppercase">작성된 게시글이 없습니다.</p>
                    )}
                  </div>
                )}

                {activeTab === 'points' && (
                  <div className="space-y-4">
                    {pointHistory.length > 0 ? pointHistory.map(item => (
                      <div key={item.id} className="p-6 bg-white/5 rounded-2xl flex justify-between items-center border border-white/5 hover:bg-white/[0.07] transition-all">
                        <div>
                          <span className="font-black block italic text-lg">{item.reason}</span>
                          <span className="text-[11px] text-gray-600">{new Date(item.created_at).toLocaleString()}</span>
                        </div>
                        <span className={`text-2xl font-black italic ${item.amount > 0 ? 'text-emerald-500' : 'text-red-600'}`}>
                          {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}P
                        </span>
                      </div>
                    )) : (
                      <p className="text-center text-gray-600 italic py-20 font-black uppercase">포인트 내역이 없습니다.</p>
                    )}
                  </div>
                )}

                {activeTab === 'coupons' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myCoupons.length > 0 ? myCoupons.map(coupon => (
                      <div key={coupon.id} className="p-8 bg-gradient-to-br from-red-600/10 to-transparent rounded-[2.5rem] border border-red-600/20 group hover:border-red-600/50 transition-all">
                        <h4 className="text-2xl font-black text-white italic mb-2">{coupon.title}</h4>
                        <p className="text-gray-400 text-sm font-bold leading-relaxed">{coupon.content}</p>
                        <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                           <span className="text-[10px] text-gray-600 font-black italic uppercase tracking-widest">Valid until {new Date(coupon.expired_at).toLocaleDateString()}</span>
                           <button className="bg-red-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase italic shadow-lg active:scale-95 transition-transform">Use Now</button>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-2 py-20 text-center bg-black/20 rounded-[2.5rem] border border-dashed border-white/5">
                        <p className="text-gray-700 font-black italic uppercase">사용 가능한 쿠폰이 없습니다.</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 하단 액션 버튼 (디자인 유지) */}
        <div className="flex justify-between items-center px-10">
          <Link to="/" className="text-gray-500 hover:text-white text-xs font-black uppercase italic tracking-widest transition-colors">← Back to Exploring</Link>
          <div className="flex gap-4">
            {currentUser.role === 'ADMIN' && (
              <button onClick={() => navigate('/admin')} className="px-8 py-3 bg-white/5 rounded-2xl text-[11px] font-black uppercase border border-white/10 italic hover:bg-white/10 transition-all">Admin Panel</button>
            )}
            <button onClick={handleLogout} className="px-8 py-3 bg-red-600 rounded-2xl text-[11px] font-black uppercase italic shadow-xl hover:bg-red-700 active:scale-95 transition-all">Logout Account</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
