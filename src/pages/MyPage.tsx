import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { supabase } from '../supabase';
import { LEVEL_NAMES } from '../types';
import { useAuth } from '../contexts/AuthContext'; // 🔴 중앙 컨텍스트 임포트
import { useFetchGuard } from '../hooks/useFetchGuard'; // 🔴 데이터 가드 임포트

const MyPage: React.FC = () => { // 🔴 Prop 제거 완료
  const navigate = useNavigate();
  
  // 1. 전역 인증 상태 구독 (중앙 엔진)
  const { currentUser, loading: authLoading, refreshUser } = useAuth(); 

  const [activeTab, setActiveTab] = useState<'activity' | 'points' | 'coupons'>('activity');
  const [isEditing, setIsEditing] = useState(false);
  const [newNickname, setNewNickname] = useState(currentUser?.nickname || '');
  const [loading, setLoading] = useState(false); // 버튼 액션 로딩
  const [dataLoading, setDataLoading] = useState(true); // DB 데이터 로딩
  
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [pointHistory, setPointHistory] = useState<any[]>([]);
  const [myCoupons, setMyCoupons] = useState<any[]>([]);

  // 2. 데이터 호출 로직
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
      console.error('MyPage 데이터 로드 에러:', err);
    } finally {
      setDataLoading(false);
    }
  };

  // 🔴 3. [데이터 가드 적용] 
  // 인증이 완료된 후 내 데이터를 가져오며, 페이지 첫 진입 시 엇박자를 방지합니다.
  useFetchGuard(fetchMyData, []);

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
      
      // 전역 유저 정보 즉시 갱신 (페이지 리로드 없이)
      await refreshUser(); 
      alert('프로필 이미지가 변경되었습니다.');
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
      await refreshUser(); // 중앙 상태 갱신
      alert('닉네임이 변경되었습니다.');
    } catch (err: any) { 
      alert(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  // 🔴 4. 전역 로딩 처리 (인증 확인 중일 때)
  if (authLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-600 font-black italic animate-pulse tracking-widest uppercase">
          Fetching Agent Intelligence...
        </div>
      </div>
    );
  }

  const nextLevelCriteria = { 2: { points: 100, reviews: 1 }, 3: { points: 300, reviews: 3 }, 4: { points: 1000, reviews: 8 } };
  const currentCriteria = (nextLevelCriteria as any)[currentUser.level + 1] || null;

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans text-white selection:bg-red-600/30">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* 상단 프로필 카드 */}
        <div className="bg-[#0f0f0f] rounded-[3rem] p-10 md:p-14 border border-white/5 relative shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="relative group w-40 h-40">
              <div className="w-full h-full rounded-[3rem] bg-gradient-to-br from-[#1a1a1a] to-black border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-inner">
                {currentUser.avatar_url ? (
                  <img src={currentUser.avatar_url} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <span className="text-6xl text-red-600 italic font-black">{currentUser.nickname?.[0]}</span>
                )}
              </div>
              <label className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-[3rem]">
                <span className="text-[10px] font-black uppercase italic">Upload</span>
                <input type="file" className="hidden" onChange={handleAvatarUpload} disabled={loading} />
              </label>
            </div>

            <div className="flex-grow text-center md:text-left">
              <div className="inline-block bg-red-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase italic mb-4 shadow-lg shadow-red-900/20">
                LV.{currentUser.level} {LEVEL_NAMES[currentUser.level]}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
                {isEditing ? (
                  <div className="flex items-center gap-3">
                    <input value={newNickname} onChange={(e) => setNewNickname(e.target.value)} className="bg-black border-2 border-red-600/50 rounded-2xl px-5 py-2 text-2xl font-black w-48 outline-none shadow-inner" />
                    <button onClick={handleUpdateNickname} disabled={loading} className="bg-emerald-600 p-2 rounded-xl active:scale-90 transition-transform">✔️</button>
                    <button onClick={() => setIsEditing(false)} className="bg-white/5 p-2 rounded-xl active:scale-90 transition-transform">❌</button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-5xl font-black italic tracking-tighter uppercase">{currentUser.nickname}님</h2>
                    <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-white transition-colors text-xl">✏️</button>
                  </>
                )}
              </div>
              <div className="flex gap-4 justify-center md:justify-start mt-6">
                <div className="bg-black/50 px-6 py-3 rounded-2xl border border-white/5 shadow-inner">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Points</p>
                  <p className="text-2xl font-black text-red-600 italic">{currentUser.points?.toLocaleString()}P</p>
                </div>
                <div className="bg-black/50 px-6 py-3 rounded-2xl border border-white/5 shadow-inner">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Reviews</p>
                  <p className="text-2xl font-black text-emerald-500 italic">{currentUser.review_count}건</p>
                </div>
              </div>
            </div>

            {currentCriteria && (
              <div className="w-full md:w-64 bg-black/40 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                <p className="text-[10px] font-black text-yellow-500 uppercase mb-6 tracking-widest italic border-b border-white/5 pb-2">Next: {LEVEL_NAMES[currentUser.level + 1]}</p>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-[9px] mb-2 font-black uppercase tracking-tighter"><span>Points</span><span className="text-red-500">{currentUser.points}/{currentCriteria.points}</span></div>
                    <div className="h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
                      <div className="bg-red-600 h-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(100, (currentUser.points/currentCriteria.points)*100)}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[9px] mb-2 font-black uppercase tracking-tighter"><span>Reviews</span><span className="text-emerald-500">{currentUser.review_count}/{currentCriteria.reviews}</span></div>
                    <div className="h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
                      <div className="bg-emerald-600 h-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(100, (currentUser.review_count/currentCriteria.reviews)*100)}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 활동 탭 섹션 */}
        <div className="bg-[#0f0f0f] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="flex bg-white/[0.02] p-2 gap-2">
            {(['activity', 'points', 'coupons'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-5 rounded-2xl font-black uppercase italic transition-all ${activeTab === tab ? 'bg-red-600 text-white shadow-xl scale-[1.02]' : 'text-gray-600 hover:text-gray-300'}`}>
                {tab === 'activity' ? '📝 Posts' : tab === 'points' ? '📋 points' : '🎟️ coupons'}
              </button>
            ))}
          </div>

          <div className="p-10 min-h-[450px]">
            {dataLoading ? (
              <div className="flex items-center justify-center h-[300px] text-gray-800 font-black italic animate-pulse tracking-widest">DECRYPTING DATA...</div>
            ) : (
              <div className="animate-in fade-in duration-500">
                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    {myPosts.length > 0 ? myPosts.map(post => (
                      <Link key={post.id} to={`/post/${post.id}`} className="flex justify-between items-center p-8 bg-white/[0.03] rounded-[2rem] border border-white/5 hover:border-red-600/40 transition-all group shadow-lg">
                        <div className="flex items-center gap-6">
                          <span className="text-red-600 font-black text-[9px] px-2 py-1 bg-red-600/10 rounded uppercase italic tracking-widest border border-red-600/10">#{post.category}</span>
                          <span className="text-xl font-bold group-hover:text-red-500 transition-colors italic tracking-tight">{post.title}</span>
                        </div>
                        <span className="text-[10px] text-gray-600 font-black uppercase">{new Date(post.created_at).toLocaleDateString()}</span>
                      </Link>
                    )) : (
                      <div className="py-32 text-center bg-black/20 rounded-[2.5rem] border border-dashed border-white/5">
                        <p className="text-gray-700 font-black italic uppercase tracking-widest text-lg">No Activity Log Found</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'points' && (
                  <div className="space-y-4">
                    {pointHistory.length > 0 ? pointHistory.map(item => (
                      <div key={item.id} className="p-8 bg-white/[0.03] rounded-[2rem] flex justify-between items-center border border-white/5 hover:bg-white/[0.05] transition-all">
                        <div>
                          <span className="font-black block italic text-xl uppercase tracking-tighter mb-1">{item.reason}</span>
                          <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{new Date(item.created_at).toLocaleString()}</span>
                        </div>
                        <span className={`text-3xl font-black italic ${item.amount > 0 ? 'text-emerald-500' : 'text-red-600'}`}>
                          {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}P
                        </span>
                      </div>
                    )) : (
                      <div className="py-32 text-center bg-black/20 rounded-[2.5rem] border border-dashed border-white/5">
                        <p className="text-gray-700 font-black italic uppercase tracking-widest text-lg">No Transaction History</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'coupons' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myCoupons.length > 0 ? myCoupons.map(coupon => (
                      <div key={coupon.id} className="p-10 bg-gradient-to-br from-[#1a1a1a] to-black rounded-[3rem] border border-red-600/20 group hover:border-red-600/50 transition-all shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform"></div>
                        <h4 className="text-3xl font-black text-white italic mb-3 tracking-tighter uppercase">{coupon.title}</h4>
                        <p className="text-gray-500 text-sm font-bold leading-relaxed mb-10">{coupon.content}</p>
                        <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                            <span className="text-[9px] text-gray-600 font-black italic uppercase tracking-widest">Expires {new Date(coupon.expired_at).toLocaleDateString()}</span>
                            <button className="bg-red-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase italic shadow-xl hover:bg-red-500 active:scale-95 transition-all">Claim Rewards</button>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-2 py-32 text-center bg-black/20 rounded-[3rem] border border-dashed border-white/10">
                        <p className="text-gray-700 font-black italic uppercase tracking-widest text-lg">Empty Coupon Vault</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 하단 액션 버튼 */}
        <div className="flex justify-between items-center px-10">
          <Link to="/" className="text-gray-600 hover:text-white text-[10px] font-black uppercase italic tracking-[0.3em] transition-colors">← Back to Exploring</Link>
          <div className="flex gap-4">
            {currentUser.role === 'ADMIN' && (
              <button onClick={() => navigate('/admin')} className="px-10 py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase border border-white/10 italic hover:bg-white/10 transition-all tracking-widest">Admin Panel</button>
            )}
            <button onClick={handleLogout} className="px-10 py-4 bg-red-600 rounded-2xl text-[10px] font-black uppercase italic shadow-2xl shadow-red-900/30 hover:bg-red-700 active:scale-95 transition-all tracking-widest">Logout Agent</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
