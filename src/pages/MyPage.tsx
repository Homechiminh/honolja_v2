import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { Helmet } from 'react-helmet-async';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { supabase } from '../supabase';
import { LEVEL_NAMES, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext'; 
import { useFetchGuard } from '../hooks/useFetchGuard'; 

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const couponRef = useRef<HTMLDivElement>(null);
  const { currentUser, loading: authLoading, initialized, refreshUser } = useAuth(); 

  const [activeTab, setActiveTab] = useState<'activity' | 'points' | 'coupons'>('activity');
  const [isEditing, setIsEditing] = useState(false);
  const [newNickname, setNewNickname] = useState(currentUser?.nickname || '');
  const [loading, setLoading] = useState(false); 
  const [dataLoading, setDataLoading] = useState(true); 
  
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [pointHistory, setPointHistory] = useState<any[]>([]);
  const [myCoupons, setMyCoupons] = useState<any[]>([]);

  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [generatedSerial, setGeneratedSerial] = useState('');

  // 🔴 데이터 로드 로직
  const fetchMyData = async () => {
    if (!currentUser?.id) return;
    setDataLoading(true);
    try {
      const { data: posts } = await supabase.from('posts').select('*').eq('author_id', currentUser.id).order('created_at', { ascending: false });
      if (posts) setMyPosts(posts);

      const { data: points } = await supabase.from('point_history').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false });
      if (points) setPointHistory(points);

      const { data: coupons } = await supabase.from('coupons').select('*').eq('user_id', currentUser.id).eq('is_used', false).order('created_at', { ascending: false });
      if (coupons) setMyCoupons(coupons);
    } catch (err: any) {
      console.error('데이터 동기화 실패:', err.message);
    } finally {
      setDataLoading(false);
    }
  };

  useFetchGuard(fetchMyData, []);

  const handleLogout = async () => {
    if (!window.confirm("로그아웃 하시겠습니까?")) return;
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
      await supabase.storage.from('avatars').upload(filePath, file);
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', currentUser.id);
      await refreshUser();
      alert('프로필 이미지가 변경되었습니다.');
    } catch (err: any) { alert(`업로드 실패: ${err.message}`); } finally { setLoading(false); }
  };

  const handleUpdateNickname = async () => {
    if (!currentUser || !newNickname.trim()) return;
    setLoading(true);
    try {
      await supabase.from('profiles').update({ nickname: newNickname }).eq('id', currentUser.id);
      setIsEditing(false);
      await refreshUser();
      alert('닉네임이 변경되었습니다.');
    } catch (err: any) { alert(`변경 실패: ${err.message}`); } finally { setLoading(false); }
  };

  const openCouponModal = (coupon: any) => {
    const serial = `HNLJ-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setGeneratedSerial(serial);
    setSelectedCoupon(coupon);
  };

  const handleDownloadAndDispose = async () => {
    if (!couponRef.current || !selectedCoupon) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(couponRef.current, { backgroundColor: '#000' });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `호놀자_쿠폰_${selectedCoupon.id}.png`;
      link.click();

      const { error } = await supabase
        .from('coupons')
        .update({ 
          is_used: true, 
          used_at: new Date().toISOString(),
          serial_number: generatedSerial 
        })
        .eq('id', selectedCoupon.id);

      if (error) throw error;
      alert('QR 저장이 완료되었습니다. 해당 쿠폰은 사용 완료 처리됩니다.');
      setSelectedCoupon(null);
      await fetchMyData(); 
    } catch (err) { alert('처리 중 오류가 발생했습니다.'); } finally { setLoading(false); }
  };

  // 🔴 튕김 방지: 초기화가 완료될 때까지 대기
  if (!initialized || (authLoading && !currentUser)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-black italic text-red-600 animate-pulse uppercase tracking-widest">
        정보 동기화 중...
      </div>
    );
  }

  const nextLevelCriteria = { 1: { points: 100, reviews: 1 }, 2: { points: 300, reviews: 3 }, 3: { points: 1000, reviews: 8 } };
  const currentCriteria = (nextLevelCriteria as any)[currentUser.level] || null;

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans text-white selection:bg-red-600/30 relative">
      <Helmet>
        <title>호놀자 | 마이페이지</title>
      </Helmet>

      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
        {/* 상단 프로필 섹션 (image_29b3ea.png 구성 반영) */}
        <div className="bg-[#0f0f0f] rounded-[3rem] p-10 md:p-14 border border-white/5 relative shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
            <div className="relative group w-40 h-40 shrink-0">
              <div className="w-full h-full rounded-[3rem] bg-gradient-to-br from-[#1a1a1a] to-black border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                {currentUser.avatar_url ? <img src={currentUser.avatar_url} className="w-full h-full object-cover" alt="Profile" /> : 
                <span className="text-6xl text-red-600 italic font-black">{currentUser.nickname?.[0].toUpperCase()}</span>}
              </div>
              <label className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-[3rem] backdrop-blur-sm">
                <span className="text-[10px] font-black uppercase italic">사진 변경</span>
                <input type="file" className="hidden" onChange={handleAvatarUpload} disabled={loading} />
              </label>
            </div>

            <div className="flex-grow text-center md:text-left">
              <div className="inline-block bg-red-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase italic mb-4 shadow-lg">
                LV.{currentUser.level} {LEVEL_NAMES[currentUser.level]}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                {isEditing ? (
                  <div className="flex items-center gap-3">
                    <input value={newNickname} onChange={(e) => setNewNickname(e.target.value)} className="bg-black border-2 border-red-600/50 rounded-2xl px-5 py-2 text-2xl font-black w-48 outline-none shadow-inner" />
                    <button onClick={handleUpdateNickname} disabled={loading} className="bg-emerald-600 p-2.5 rounded-xl">✔️</button>
                    <button onClick={() => setIsEditing(false)} className="bg-white/5 p-2.5 rounded-xl">❌</button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">{currentUser.nickname}님</h2>
                    <button onClick={() => setIsEditing(true)} className="text-gray-600 hover:text-white transition-colors text-xl p-2 bg-white/5 rounded-xl">✏️</button>
                  </>
                )}
              </div>
              <div className="flex gap-4 mt-6">
                <div className="bg-black/50 px-6 py-4 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">포인트</p>
                  <p className="text-2xl font-black text-red-600">{currentUser.points?.toLocaleString()}P</p>
                </div>
                <div className="bg-black/50 px-6 py-4 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">후기 수</p>
                  <p className="text-2xl font-black text-emerald-500">{currentUser.review_count || 0}건</p>
                </div>
              </div>
            </div>

            {/* 등업 목표 게이지 */}
            {currentCriteria && (
              <div className="w-full md:w-64 bg-black/40 p-8 rounded-[2.5rem] border border-white/5">
                <p className="text-[10px] font-black text-yellow-500 uppercase mb-6 italic tracking-widest">NEXT GOAL: {LEVEL_NAMES[currentUser.level + 1]}</p>
                <div className="space-y-4">
                  <div className="h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
                    <div className="bg-red-600 h-full transition-all" style={{ width: `${Math.min(100, (currentUser.points / currentCriteria.points) * 100)}%` }}></div>
                  </div>
                  <div className="h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
                    <div className="bg-emerald-600 h-full transition-all" style={{ width: `${Math.min(100, ((currentUser.review_count || 0) / currentCriteria.reviews) * 100)}%` }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 활동 탭 구역 (한국어 텍스트 복구) */}
        <div className="bg-[#0f0f0f] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="flex bg-white/[0.02] p-2 gap-2">
            {(['activity', 'points', 'coupons'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-5 rounded-2xl font-black uppercase italic transition-all ${activeTab === tab ? 'bg-red-600 text-white shadow-xl' : 'text-gray-600 hover:text-white'}`}>
                {tab === 'activity' ? '📝 내 작성글' : tab === 'points' ? '📋 활동 기록' : '🎟️ 내 쿠폰함'}
              </button>
            ))}
          </div>

          <div className="p-10 min-h-[450px]">
            {dataLoading ? <div className="text-center py-20 animate-pulse">데이터 로딩 중...</div> : (
              <div className="animate-in fade-in duration-500">
                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    {myPosts.length > 0 ? myPosts.map(post => (
                      <Link key={post.id} to={`/post/${post.id}`} className="flex justify-between items-center p-8 bg-white/[0.03] rounded-[2.5rem] border border-white/5 hover:border-red-600/40 transition-all group">
                        <div className="flex items-center gap-6">
                          <span className="text-red-600 font-black text-[9px] px-3 py-1.5 bg-red-600/10 rounded-full italic tracking-widest border border-red-600/10">#{post.category}</span>
                          <span className="text-xl font-bold group-hover:text-red-500 transition-colors italic tracking-tight">{post.title}</span>
                        </div>
                        <span className="text-[10px] text-gray-600 font-black uppercase italic shrink-0 ml-4">{new Date(post.created_at).toLocaleDateString()}</span>
                      </Link>
                    )) : <div className="py-32 text-center opacity-40 italic font-black uppercase tracking-widest">작성된 게시글이 없습니다.</div>}
                  </div>
                )}

                {activeTab === 'points' && (
                  <div className="space-y-4">
                    {pointHistory.length > 0 ? pointHistory.map(item => (
                      <div key={item.id} className="p-8 bg-white/[0.03] rounded-[2.5rem] flex justify-between items-center border border-white/5">
                        <div className="space-y-1">
                          <span className="font-black block italic text-xl uppercase tracking-tighter">{item.reason}</span>
                          <span className="text-[10px] text-gray-600 font-bold uppercase italic">{new Date(item.created_at).toLocaleString()}</span>
                        </div>
                        <span className={`text-3xl font-black italic ${item.amount > 0 ? 'text-emerald-500' : 'text-red-600'}`}>{item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}P</span>
                      </div>
                    )) : <div className="py-32 text-center opacity-40 italic font-black uppercase tracking-widest">활동 기록이 없습니다.</div>}
                  </div>
                )}

                {activeTab === 'coupons' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {myCoupons.length > 0 ? myCoupons.map(coupon => (
                      <div key={coupon.id} className="p-10 bg-gradient-to-br from-[#1a1a1a] to-black rounded-[3.5rem] border border-red-600/20 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform blur-2xl"></div>
                        <h4 className="text-3xl font-black text-white italic mb-4 tracking-tighter uppercase leading-none">{coupon.title}</h4>
                        <p className="text-gray-500 text-sm font-bold leading-relaxed mb-10 italic">{coupon.content}</p>
                        <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                            <span className="text-[9px] text-gray-600 font-black italic uppercase tracking-[0.2em]">만료일: {new Date(coupon.expired_at).toLocaleDateString()}</span>
                            <button onClick={() => openCouponModal(coupon)} className="bg-red-600 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase italic shadow-xl hover:bg-red-500 transition-all">사용하기</button>
                        </div>
                      </div>
                    )) : <div className="col-span-2 py-32 text-center opacity-40 italic font-black uppercase tracking-widest">보유한 쿠폰이 없습니다.</div>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 하단 버튼 구역 */}
        <div className="flex justify-between items-center px-10">
          <Link to="/" className="text-gray-400 hover:text-white text-[11px] font-black uppercase italic tracking-[0.3em] transition-all">← 메인으로 이동</Link>
          <div className="flex gap-4">
            {currentUser.role === UserRole.ADMIN && (
              <button onClick={() => navigate('/admin')} className="px-10 py-5 bg-white/5 rounded-2xl text-[10px] font-black uppercase border border-white/10 italic shadow-xl hover:bg-white/10 transition-all">관리자 도구</button>
            )}
            <button onClick={handleLogout} className="px-10 py-5 bg-red-600/10 border border-red-600/30 text-red-500 rounded-2xl text-[10px] font-black uppercase italic shadow-2xl hover:bg-red-600 hover:text-white transition-all tracking-[0.2em]">로그아웃</button>
          </div>
        </div>
      </div>

      {/* QR 모달 (한국어 가이드 적용) */}
      {selectedCoupon && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative bg-[#0a0a0a] border border-red-600/30 p-10 rounded-[3.5rem] max-w-[400px] w-full text-center">
            
            <button onClick={() => setSelectedCoupon(null)} className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all group">
              <span className="text-gray-500 group-hover:text-white text-xl">✕</span>
            </button>

            <h3 className="text-2xl font-black text-white italic mb-2 uppercase tracking-tighter">Coupon Authentication</h3>
            <p className="text-gray-500 text-[10px] font-bold mb-8 uppercase tracking-widest italic">QR을 저장하면 해당 쿠폰은 즉시 사용 처리됩니다.</p>
            
            <div ref={couponRef} className="bg-black p-8 rounded-[2rem] border border-white/5 mb-8 flex flex-col items-center">
              <p className="text-red-600 font-black italic text-sm mb-6 uppercase tracking-widest">{selectedCoupon.title}</p>
              <div className="bg-white p-4 rounded-3xl mb-6 shadow-2xl">
                <QRCodeCanvas value={`${selectedCoupon.id}|${generatedSerial}`} size={180} level="H" />
              </div>
              <p className="text-white font-black text-lg tracking-[0.2em] italic mb-2">{generatedSerial}</p>
              <p className="text-gray-600 text-[9px] font-bold uppercase italic tracking-widest">소유자: {currentUser.nickname}</p>
            </div>

            <button onClick={handleDownloadAndDispose} disabled={loading} className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-xs uppercase italic shadow-xl hover:bg-red-500 transition-all">
              {loading ? '처리 중...' : 'QR 저장 및 사용완료'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPage;
