import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { supabase } from '../supabase';
import { LEVEL_NAMES, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext'; 
import { useFetchGuard } from '../hooks/useFetchGuard'; 

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  
  // 1. 전역 인증 상태 구독
  const { currentUser, loading: authLoading, refreshUser } = useAuth(); 

  const [activeTab, setActiveTab] = useState<'activity' | 'points' | 'coupons'>('activity');
  const [isEditing, setIsEditing] = useState(false);
  const [newNickname, setNewNickname] = useState(currentUser?.nickname || '');
  const [loading, setLoading] = useState(false); // 버튼 액션(업로드/수정) 로딩
  const [dataLoading, setDataLoading] = useState(true); // DB 데이터 호출 로딩
  
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [pointHistory, setPointHistory] = useState<any[]>([]);
  const [myCoupons, setMyCoupons] = useState<any[]>([]);

  /**
   * 🔴 [방탄 fetch] 내 활동 정보 통합 로드
   * 어떤 구간에서 에러(406 등)가 발생해도 finally 블록이 스피너를 해제합니다.
   */
  const fetchMyData = async () => {
    if (!currentUser?.id) return;
    setDataLoading(true); // 데이터 로딩 시작
    try {
      // 1. 내가 작성한 게시글
      const { data: posts, error: postErr } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', currentUser.id)
        .order('created_at', { ascending: false });
      if (postErr) throw postErr;
      if (posts) setMyPosts(posts);

      // 2. 포인트 적립/사용 내역
      const { data: points, error: pointErr } = await supabase
        .from('point_history')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
      if (pointErr) throw pointErr;
      if (points) setPointHistory(points);

      // 3. 보유 쿠폰 내역 (미사용)
      const { data: coupons, error: couponErr } = await supabase
        .from('coupons')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('is_used', false)
        .order('created_at', { ascending: false });
      if (couponErr) throw couponErr;
      if (coupons) setMyCoupons(coupons);

    } catch (err: any) {
      console.error('Agent Data Sync Failed (406 등):', err.message);
      // 에러 발생 시 리스트 초기화
      setMyPosts([]);
      setPointHistory([]);
      setMyCoupons([]);
    } finally {
      // 🔴 핵심: 모든 요청 완료 또는 실패 후 로딩 해제
      setDataLoading(false);
    }
  };

  /**
   * 🔴 [데이터 가드 적용] 
   * 인증이 확정된 후 내 데이터를 안전하게 낚아옵니다.
   */
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
      
      await refreshUser(); // 중앙 상태 즉시 갱신
      alert('프로필 이미지가 변경되었습니다.');
    } catch (err: any) { 
      alert(`이미지 업로드 실패: ${err.message}`); 
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
      await refreshUser(); // 중앙 상태 즉시 갱신
      alert('닉네임이 성공적으로 변경되었습니다.');
    } catch (err: any) { 
      alert(`닉네임 변경 실패: ${err.message}`); 
    } finally { 
      setLoading(false); 
    }
  };

  // 🔴 인증 확인 중일 때 로딩 UI
  if (authLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-600 font-black italic animate-pulse tracking-[0.3em] uppercase text-xl">
          FETCHING AGENT DATA...
        </div>
      </div>
    );
  }

  const nextLevelCriteria = { 2: { points: 100, reviews: 1 }, 3: { points: 300, reviews: 3 }, 4: { points: 1000, reviews: 8 } };
  const currentCriteria = (nextLevelCriteria as any)[currentUser.level + 1] || null;

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans text-white selection:bg-red-600/30">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* 상단 프로필 섹션 */}
        <div className="bg-[#0f0f0f] rounded-[3rem] p-10 md:p-14 border border-white/5 relative shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
            <div className="relative group w-40 h-40 shrink-0">
              <div className="w-full h-full rounded-[3rem] bg-gradient-to-br from-[#1a1a1a] to-black border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-2xl group-hover:border-red-600/50 transition-all">
                {currentUser.avatar_url ? (
                  <img src={currentUser.avatar_url} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <span className="text-6xl text-red-600 italic font-black">{currentUser.nickname?.[0].toUpperCase()}</span>
                )}
              </div>
              <label className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-[3rem] backdrop-blur-sm">
                <span className="text-[10px] font-black uppercase italic tracking-widest">Update Photo</span>
                <input type="file" className="hidden" onChange={handleAvatarUpload} disabled={loading} />
              </label>
            </div>

            <div className="flex-grow text-center md:text-left">
              <div className="inline-block bg-red-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase italic mb-4 shadow-lg shadow-red-900/30">
                LV.{currentUser.level} {LEVEL_NAMES[currentUser.level]}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                {isEditing ? (
                  <div className="flex items-center gap-3">
                    <input value={newNickname} onChange={(e) => setNewNickname(e.target.value)} className="bg-black border-2 border-red-600/50 rounded-2xl px-5 py-2 text-2xl font-black w-48 outline-none shadow-inner italic" />
                    <button onClick={handleUpdateNickname} disabled={loading} className="bg-emerald-600 p-2.5 rounded-xl active:scale-90 transition-transform">✔️</button>
                    <button onClick={() => setIsEditing(false)} className="bg-white/5 p-2.5 rounded-xl active:scale-90 transition-transform">❌</button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">{currentUser.nickname}님</h2>
                    <button onClick={() => setIsEditing(true)} className="text-gray-600 hover:text-white transition-colors text-xl p-2 bg-white/5 rounded-xl">✏️</button>
                  </>
                )}
              </div>
              <div className="flex gap-4 justify-center md:justify-start mt-6">
                <div className="bg-black/50 px-6 py-4 rounded-2xl border border-white/5 shadow-inner">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">Intelligence Points</p>
                  <p className="text-2xl font-black text-red-600 italic">{currentUser.points?.toLocaleString()}P</p>
                </div>
                <div className="bg-black/50 px-6 py-4 rounded-2xl border border-white/5 shadow-inner">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">Verified Logs</p>
                  <p className="text-2xl font-black text-emerald-500 italic">{currentUser.review_count || 0}건</p>
                </div>
              </div>
            </div>

            {currentCriteria && (
              <div className="w-full md:w-64 bg-black/40 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl backdrop-blur-md">
                <p className="text-[10px] font-black text-yellow-500 uppercase mb-6 tracking-widest italic border-b border-white/5 pb-2">Next Upgrade: {LEVEL_NAMES[currentUser.level + 1]}</p>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-[9px] mb-2 font-black uppercase tracking-tighter italic"><span>Points Progress</span><span className="text-red-500">{currentUser.points}/{currentCriteria.points}</span></div>
                    <div className="h-1.5 bg-black rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <div className="bg-red-600 h-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(100, (currentUser.points/currentCriteria.points)*100)}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[9px] mb-2 font-black uppercase tracking-tighter italic"><span>Logs Required</span><span className="text-emerald-500">{currentUser.review_count || 0}/{currentCriteria.reviews}</span></div>
                    <div className="h-1.5 bg-black rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <div className="bg-emerald-600 h-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(100, ((currentUser.review_count || 0)/currentCriteria.reviews)*100)}%` }}></div>
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
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-5 rounded-2xl font-black uppercase italic transition-all ${activeTab === tab ? 'bg-red-600 text-white shadow-2xl scale-[1.02]' : 'text-gray-600 hover:text-gray-300'}`}>
                {tab === 'activity' ? '📝 Action Logs' : tab === 'points' ? '📋 Transaction' : '🎟️ Vault'}
              </button>
            ))}
          </div>

          <div className="p-10 min-h-[450px]">
            {dataLoading ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-gray-800 font-black italic animate-pulse space-y-4">
                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="tracking-[0.3em] text-[10px]">DECRYPTING AGENT LOGS...</span>
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    {myPosts.length > 0 ? myPosts.map(post => (
                      <Link key={post.id} to={`/post/${post.id}`} className="flex justify-between items-center p-8 bg-white/[0.03] rounded-[2.5rem] border border-white/5 hover:border-red-600/40 transition-all group shadow-lg">
                        <div className="flex items-center gap-6">
                          <span className="text-red-600 font-black text-[9px] px-3 py-1.5 bg-red-600/10 rounded-full uppercase italic tracking-widest border border-red-600/10">#{post.category}</span>
                          <span className="text-xl font-bold group-hover:text-red-500 transition-colors italic tracking-tight break-keep leading-tight">{post.title}</span>
                        </div>
                        <span className="text-[10px] text-gray-600 font-black uppercase italic shrink-0 ml-4">{new Date(post.created_at).toLocaleDateString()}</span>
                      </Link>
                    )) : (
                      <div className="py-32 text-center bg-black/20 rounded-[2.5rem] border border-dashed border-white/5 opacity-40">
                        <p className="text-gray-700 font-black italic uppercase tracking-widest text-lg">No Intelligence Records Found</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'points' && (
                  <div className="space-y-4">
                    {pointHistory.length > 0 ? pointHistory.map(item => (
                      <div key={item.id} className="p-8 bg-white/[0.03] rounded-[2.5rem] flex justify-between items-center border border-white/5 hover:bg-white/[0.05] transition-all">
                        <div className="space-y-1">
                          <span className="font-black block italic text-xl uppercase tracking-tighter">{item.reason}</span>
                          <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest italic">{new Date(item.created_at).toLocaleString()}</span>
                        </div>
                        <span className={`text-3xl font-black italic ${item.amount > 0 ? 'text-emerald-500' : 'text-red-600'}`}>
                          {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}P
                        </span>
                      </div>
                    )) : (
                      <div className="py-32 text-center bg-black/20 rounded-[2.5rem] border border-dashed border-white/5 opacity-40">
                        <p className="text-gray-700 font-black italic uppercase tracking-widest text-lg">Clean Transaction Record</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'coupons' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {myCoupons.length > 0 ? myCoupons.map(coupon => (
                      <div key={coupon.id} className="p-10 bg-gradient-to-br from-[#1a1a1a] to-black rounded-[3.5rem] border border-red-600/20 group hover:border-red-600/50 transition-all shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform blur-2xl"></div>
                        <h4 className="text-3xl font-black text-white italic mb-4 tracking-tighter uppercase leading-none">{coupon.title}</h4>
                        <p className="text-gray-500 text-sm font-bold leading-relaxed mb-10 italic">{coupon.content}</p>
                        <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                            <span className="text-[9px] text-gray-600 font-black italic uppercase tracking-[0.2em]">Expires {new Date(coupon.expired_at).toLocaleDateString()}</span>
                            <button className="bg-red-600 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase italic shadow-xl hover:bg-red-500 active:scale-95 transition-all">Redeem Now</button>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-2 py-32 text-center bg-black/20 rounded-[3rem] border border-dashed border-white/10 opacity-40">
                        <p className="text-gray-700 font-black italic uppercase tracking-widest text-lg">The Vault is Empty</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 하단 액션 버튼 */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-10">
          <Link to="/" className="text-gray-600 hover:text-white text-[10px] font-black uppercase italic tracking-[0.3em] transition-all border-b border-transparent hover:border-white">← Return to Exploration</Link>
          <div className="flex gap-4">
            {currentUser.role === UserRole.ADMIN && (
              <button onClick={() => navigate('/admin')} className="px-10 py-5 bg-white/5 rounded-2xl text-[10px] font-black uppercase border border-white/10 italic hover:bg-white/10 transition-all tracking-[0.2em] shadow-xl">Admin Terminal</button>
            )}
            <button onClick={handleLogout} className="px-10 py-5 bg-red-600 rounded-2xl text-[10px] font-black uppercase italic shadow-2xl shadow-red-900/40 hover:bg-red-700 active:scale-95 transition-all tracking-[0.2em]">Terminate Session</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
