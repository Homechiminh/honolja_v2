import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { supabase } from '../supabase';
import { LEVEL_NAMES } from '../types'; // 🔴 등급 명칭 가져오기
import type { User } from '../types';

interface MyPageProps {
  currentUser: User | null;
}

const MyPage: React.FC<MyPageProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'activity' | 'points' | 'coupons'>('activity'); // 🔴 쿠폰 탭 추가
  const [isEditing, setIsEditing] = useState(false);
  const [newNickname, setNewNickname] = useState(currentUser?.nickname || '');
  const [loading, setLoading] = useState(false);
  
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [pointHistory, setPointHistory] = useState<any[]>([]);
  const [myCoupons, setMyCoupons] = useState<any[]>([]); // 🔴 쿠폰 상태 추가

  useEffect(() => {
    if (!currentUser) return;

    const fetchMyData = async () => {
      // 1. 내가 쓴 게시글 가져오기
      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', currentUser.id)
        .order('created_at', { ascending: false });
      if (posts) setMyPosts(posts);

      // 2. 포인트 이용 내역 가져오기
      const { data: points } = await supabase
        .from('point_history')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
      if (points) setPointHistory(points);

      // 3. 보유 쿠폰 가져오기 (사용하지 않은 것만)
      const { data: coupons } = await supabase
        .from('coupons')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('is_used', false)
        .order('created_at', { ascending: false });
      if (coupons) setMyCoupons(coupons);
    };

    fetchMyData();
  }, [currentUser]);

  // 프로필 사진 업로드
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `avatars/${currentUser.id}_${Math.random()}.${fileExt}`;

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

  if (!currentUser) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <p className="text-white font-black italic animate-pulse">LOADING PROFILE...</p>
    </div>
  );

  // 등업 조건 계산 (성취도 % 계산용)
  const nextLevelCriteria = {
    2: { points: 100, reviews: 1 },
    3: { points: 300, reviews: 3 },
    4: { points: 1000, reviews: 8 },
  };
  const currentCriteria = (nextLevelCriteria as any)[currentUser.level + 1] || null;

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* 상단 프로필 카드 섹션 */}
        <div className="bg-[#0f0f0f] rounded-[3rem] p-10 md:p-14 border border-white/5 relative shadow-2xl overflow-hidden">
          {/* 배경 장식 */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] -z-10"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="relative group">
              <div className="w-40 h-40 rounded-[3rem] bg-gradient-to-br from-[#1a1a1a] to-black border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-2xl transition-all group-hover:border-red-600/50">
                {currentUser.avatar_url ? (
                  <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl font-black italic text-red-600">{currentUser.nickname?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <label className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-[3rem]">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Edit Avatar</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={loading} />
              </label>
            </div>

            <div className="flex-grow text-center md:text-left">
              <div className="inline-block bg-red-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase italic tracking-widest mb-4">
                LV.{currentUser.level} {LEVEL_NAMES[currentUser.level]}
              </div>
              
              <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
                {isEditing ? (
                  <div className="flex items-center gap-3">
                    <input 
                      value={newNickname} 
                      onChange={(e) => setNewNickname(e.target.value)}
                      className="bg-black border-2 border-red-600/50 rounded-2xl px-5 py-2 text-2xl font-black outline-none w-48"
                    />
                    <button onClick={handleUpdateNickname} className="bg-emerald-600 p-2 rounded-xl">✔️</button>
                    <button onClick={() => setIsEditing(false)} className="bg-white/5 p-2 rounded-xl">❌</button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">{currentUser.nickname}님</h2>
                    <button onClick={() => setIsEditing(true)} className="text-xl hover:scale-110 transition-transform">✏️</button>
                  </>
                )}
              </div>
              <p className="text-gray-500 font-bold mb-8 italic tracking-wide">{currentUser.email}</p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="bg-black/50 px-6 py-3 rounded-2xl border border-white/5 text-center min-w-[120px]">
                  <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Activity Points</p>
                  <p className="text-xl font-black text-red-600 italic">{currentUser.points?.toLocaleString()}P</p>
                </div>
                <div className="bg-black/50 px-6 py-3 rounded-2xl border border-white/5 text-center min-w-[120px]">
                  <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Review Count</p>
                  <p className="text-xl font-black text-emerald-500 italic">{currentUser.review_count}건</p>
                </div>
              </div>
            </div>

            {/* 등업 가이드 (현재 등급 기준) */}
            {currentCriteria && (
              <div className="w-full md:w-64 bg-white/5 p-6 rounded-[2rem] border border-white/5">
                <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-4">Next Level: {LEVEL_NAMES[currentUser.level + 1]}</p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1 uppercase"><span>Points</span><span>{currentUser.points}/{currentCriteria.points}</span></div>
                    <div className="h-1.5 bg-black rounded-full overflow-hidden"><div className="bg-red-600 h-full transition-all" style={{ width: `${Math.min(100, (currentUser.points/currentCriteria.points)*100)}%` }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1 uppercase"><span>Reviews</span><span>{currentUser.review_count}/{currentCriteria.reviews}</span></div>
                    <div className="h-1.5 bg-black rounded-full overflow-hidden"><div className="bg-emerald-600 h-full transition-all" style={{ width: `${Math.min(100, (currentUser.review_count/currentCriteria.reviews)*100)}%` }}></div></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 활동 및 포인트 관리 탭 */}
        <div className="bg-[#0f0f0f] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="flex bg-white/5 p-2 gap-2">
            {[
              { id: 'activity', name: '내 게시글', icon: '📝' },
              { id: 'points', name: '포인트 내역', icon: '📋' },
              { id: 'coupons', name: '나의 쿠폰함', icon: '🎟️' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)} 
                className={`flex-1 py-5 rounded-2xl font-black italic uppercase transition-all flex items-center justify-center gap-3 ${activeTab === tab.id ? 'bg-red-600 text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}
              >
                <span>{tab.icon}</span> {tab.name}
              </button>
            ))}
          </div>

          <div className="p-10 min-h-[400px]">
            {activeTab === 'activity' && (
              <div className="space-y-4">
                {myPosts.length > 0 ? myPosts.map(post => (
                  <Link key={post.id} to={`/post/${post.id}`} className="flex justify-between items-center p-6 bg-white/5 rounded-[1.5rem] border border-white/5 hover:border-red-600/50 transition-all group">
                    <div className="flex items-center gap-4">
                      <span className="text-red-600 font-bold opacity-50">#{post.category.toUpperCase()}</span>
                      <span className="text-lg font-bold group-hover:text-red-500 transition-colors italic">{post.title}</span>
                    </div>
                    <span className="text-[11px] text-gray-600 font-bold">{new Date(post.created_at).toLocaleDateString()}</span>
                  </Link>
                )) : <p className="text-center text-gray-600 italic py-20 font-black uppercase">작성된 게시글이 없습니다.</p>}
              </div>
            )}

            {activeTab === 'points' && (
              <div className="space-y-4">
                {pointHistory.length > 0 ? pointHistory.map(item => (
                  <div key={item.id} className="p-6 bg-white/5 rounded-[1.5rem] border border-white/5 flex justify-between items-center">
                    <div>
                      <span className="font-black block italic text-lg mb-1">{item.reason}</span>
                      <span className="text-[11px] text-gray-600 font-bold uppercase tracking-widest">{new Date(item.created_at).toLocaleString()}</span>
                    </div>
                    <span className={`text-2xl font-black italic ${item.amount > 0 ? 'text-emerald-500' : 'text-red-600'}`}>
                      {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()} <span className="text-[10px] ml-1">P</span>
                    </span>
                  </div>
                )) : <p className="text-center text-gray-600 italic py-20 font-black uppercase">포인트 적립 내역이 없습니다.</p>}
              </div>
            )}

            {activeTab === 'coupons' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myCoupons.length > 0 ? myCoupons.map(coupon => (
                  <div key={coupon.id} className="p-8 bg-gradient-to-br from-red-600/10 to-transparent rounded-[2.5rem] border border-red-600/20 relative overflow-hidden group hover:scale-[1.02] transition-all">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-600/10 rounded-full blur-2xl group-hover:bg-red-600/20 transition-all"></div>
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest block mb-4 italic">Exclusive Reward</span>
                    <h4 className="text-2xl font-black text-white italic mb-2 tracking-tighter">{coupon.title}</h4>
                    <p className="text-gray-400 text-sm font-bold leading-relaxed">{coupon.content}</p>
                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                      <span className="text-[10px] text-gray-600 font-black uppercase italic">Exp: {new Date(coupon.expired_at).toLocaleDateString()}</span>
                      <button className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase italic border border-white/10 transition-all">Use Now</button>
                    </div>
                  </div>
                )) : <p className="col-span-2 text-center text-gray-600 italic py-20 font-black uppercase">사용 가능한 쿠폰이 없습니다.</p>}
              </div>
            )}
          </div>
        </div>

        {/* 하단 관리자/로그아웃 버튼 세트 */}
        <div className="flex justify-between items-center px-10">
          <Link to="/" className="text-gray-500 hover:text-white transition-all text-xs font-black uppercase italic tracking-widest">← Back to Home</Link>
          <div className="flex gap-4">
            {currentUser.role === 'ADMIN' && (
              <button onClick={() => navigate('/admin')} className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[11px] font-black uppercase italic border border-white/10 transition-all">Admin Panel</button>
            )}
            <button onClick={() => { supabase.auth.signOut(); navigate('/'); window.location.reload(); }} className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-2xl text-[11px] font-black uppercase italic shadow-xl shadow-red-600/20 transition-all">Logout Account</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MyPage;
