import React, { useState, useRef } from 'react';
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

  // 데이터 로드 로직
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
      
      alert('프로필 이미지가 변경되었습니다.');
      window.location.reload(); // 새로고침으로 상태 동기화
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
      // 1. Supabase 프로필 업데이트
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ nickname: newNickname.trim() })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;

      // 2. 성공 알림 및 새로고침 (l is not a function 에러 방지)
      alert('닉네임이 변경되었습니다.');
      window.location.reload(); 
      
    } catch (err: any) { 
      console.error('Update Error:', err);
      alert(`변경 실패 혹은 동기화 오류: ${err.message || '다시 시도해주세요.'}`); 
      window.location.reload();
    } finally { 
      setLoading(false); 
    }
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
    } catch (err) { 
      alert('처리 중 오류가 발생했습니다.'); 
    } finally { 
      setLoading(false); 
    }
  };

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
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 md:px-6 font-sans text-white selection:bg-red-600/30 relative">
      <Helmet><title>호놀자 | 마이페이지</title></Helmet>

      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
        {/* 상단 프로필 섹션 */}
        <div className="bg-[#0f0f0f] rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-14 border border-white/5 relative shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 relative z-10">
            <div className="relative group w-32 h-32 md:w-40 md:h-40 shrink-0">
              <div className="w-full h-full rounded-[2.5rem] md:rounded-[3rem] bg-gradient-to-br from-[#1a1a1a] to-black border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                {currentUser.avatar_url ? <img src={currentUser.avatar_url} className="w-full h-full object-cover" alt="Profile" /> : 
                <span className="text-5xl md:text-6xl text-red-600 italic font-black">{currentUser.nickname?.[0].toUpperCase()}</span>}
              </div>
              <label className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-[2.5rem] md:rounded-[3rem] backdrop-blur-sm">
                <span className="text-[10px] font-black uppercase italic">사진 변경</span>
                <input type="file" className="hidden" onChange={handleAvatarUpload} disabled={loading} />
              </label>
            </div>

            <div className="flex-grow text-center lg:text-left">
              <div className="inline-block bg-red-600 text-[9px] md:text-[10px] font-black px-4 py-1.5 rounded-full uppercase italic mb-4 shadow-lg">
                LV.{currentUser.level} {LEVEL_NAMES[currentUser.level]}
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                {isEditing ? (
                  <div className="flex items-center gap-3">
                    <input 
                      value={newNickname} 
                      onChange={(e) => setNewNickname(e.target.value)} 
                      className="bg-black border-2 border-red-600/50 rounded-2xl px-4 py-2 text-xl md:text-2xl font-black w-40 md:w-48 outline-none shadow-inner text-white" 
                    />
                    <button onClick={handleUpdateNickname} disabled={loading} className="bg-emerald-600 p-2 rounded-xl text-sm hover:scale-110 transition-transform">✔️</button>
                    <button onClick={() => setIsEditing(false)} className="bg-white/5 p-2 rounded-xl text-sm hover:scale-110 transition-transform">❌</button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">{currentUser.nickname}님</h2>
                    <button onClick={() => setIsEditing(true)} className="text-gray-600 hover:text-white transition-colors text-lg p-2 bg-white/5 rounded-xl">✏️</button>
                  </>
                )}
              </div>
              <div className="flex justify-center lg:justify-start gap-4 mt-6">
                <div className="bg-black/50 px-4 md:px-6 py-3 md:py-4 rounded-2xl border border-white/5">
                  <p className="text-[8px] md:text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">포인트</p>
                  <p className="text-xl md:text-2xl font-black text-red-600">{currentUser.points?.toLocaleString()}P</p>
                </div>
                <div className="bg-black/50 px-4 md:px-6 py-3 md:py-4 rounded-2xl border border-white/5">
                  <p className="text-[8px] md:text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">후기 수</p>
                  <p className="text-xl md:text-2xl font-black text-emerald-500">{currentUser.review_count || 0}건</p>
                </div>
              </div>
            </div>

            {currentCriteria && (
              <div className="w-full lg:w-72 bg-black/60 p-6 md:p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
                <p className="text-[10px] font-black text-yellow-500 uppercase mb-6 italic tracking-widest text-center">다음 목표: {LEVEL_NAMES[currentUser.level + 1]}</p>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black uppercase text-gray-400">
                      <span>포인트 달성률</span>
                      <span className="text-red-500">{currentUser.points} / {currentCriteria.points}P</span>
                    </div>
                    <div className="h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
                      <div className="bg-red-600 h-full transition-all duration-1000" style={{ width: `${Math.min(100, (currentUser.points / currentCriteria.points) * 100)}%` }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black uppercase text-gray-400">
                      <span>후기 달성률</span>
                      <span className="text-emerald-500">{currentUser.review_count || 0} / {currentCriteria.reviews}건</span>
                    </div>
                    <div className="h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
                      <div className="bg-emerald-600 h-full transition-all duration-1000" style={{ width: `${Math.min(100, ((currentUser.review_count || 0) / currentCriteria.reviews) * 100)}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 활동 탭 섹션 */}
        <div className="bg-[#0f0f0f] rounded-[2.5rem] md:rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="flex bg-white/[0.02] p-2 gap-1 md:gap-2">
            {(['activity', 'points', 'coupons'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase italic text-[10px] md:text-sm transition-all ${activeTab === tab ? 'bg-red-600 text-white shadow-xl' : 'text-gray-600 hover:text-white'}`}>
                {tab === 'activity' ? '📝 작성글' : tab === 'points' ? '📋 기록' : '🎟️ 쿠폰함'}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-10 min-h-[400px]">
            {dataLoading ? <div className="text-center py-20 animate-pulse text-gray-500 font-bold">데이터 로딩 중...</div> : (
              <div className="animate-in fade-in duration-500">
                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    {myPosts.length > 0 ? myPosts.map(post => (
                      <Link key={post.id} to={`/post/${post.id}`} className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 md:p-8 bg-white/[0.03] rounded-[2rem] md:rounded-[2.5rem] border border-white/5 hover:border-red-600/40 transition-all group gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-6 w-full">
                          <span className="text-red-600 font-black text-[9px] px-3 py-1 bg-red-600/10 rounded-full italic w-fit">#{post.category}</span>
                          <span className="text-lg md:text-xl font-bold group-hover:text-red-500 transition-colors italic tracking-tight break-keep">{post.title}</span>
                        </div>
                        <span className="text-[9px] text-gray-600 font-black uppercase italic shrink-0">{new Date(post.created_at).toLocaleDateString()}</span>
                      </Link>
                    )) : <div className="py-32 text-center opacity-30 italic font-black uppercase">작성된 게시글이 없습니다.</div>}
                  </div>
                )}

                {activeTab === 'points' && (
                  <div className="space-y-4">
                    {pointHistory.length > 0 ? pointHistory.map(item => (
                      <div key={item.id} className="p-6 md:p-8 bg-white/[0.03] rounded-[2rem] flex justify-between items-center border border-white/5">
                        <div className="space-y-1">
                          <span className="font-black block italic text-lg md:text-xl uppercase tracking-tighter">{item.reason}</span>
                          <span className="text-[9px] text-gray-600 font-bold italic">{new Date(item.created_at).toLocaleString()}</span>
                        </div>
                        <span className={`text-2xl md:text-3xl font-black italic ${item.amount > 0 ? 'text-emerald-500' : 'text-red-600'}`}>{item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}P</span>
                      </div>
                    )) : <div className="py-32 text-center opacity-30 italic font-black uppercase">활동 기록이 없습니다.</div>}
                  </div>
                )}

                {activeTab === 'coupons' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {myCoupons.length > 0 ? myCoupons.map(coupon => (
                      <div key={coupon.id} className="p-8 md:p-10 bg-gradient-to-br from-[#1a1a1a] to-black rounded-[2.5rem] md:rounded-[3.5rem] border border-red-600/20 shadow-2xl relative overflow-hidden group">
                        <h4 className="text-2xl md:text-3xl font-black text-white italic mb-3 tracking-tighter uppercase">{coupon.title}</h4>
                        <p className="text-gray-500 text-xs md:text-sm font-bold leading-relaxed mb-8 italic">{coupon.content}</p>
                        <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                            <span className="text-[9px] text-gray-600 font-black italic">만료: {new Date(coupon.expired_at).toLocaleDateString()}</span>
                            <button onClick={() => openCouponModal(coupon)} className="bg-red-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase italic shadow-xl hover:bg-red-500 transition-all">사용하기</button>
                        </div>
                      </div>
                    )) : <div className="col-span-2 py-32 text-center opacity-30 italic font-black uppercase">보유한 쿠폰이 없습니다.</div>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-8 px-6 md:px-10">
          <Link to="/" className="text-gray-500 hover:text-white text-[10px] md:text-[11px] font-black uppercase italic tracking-[0.3em] transition-all">← 메인으로 이동</Link>
          <div className="flex gap-4 w-full sm:w-auto">
            {currentUser.role === UserRole.ADMIN && (
              <button onClick={() => navigate('/admin')} className="flex-1 sm:flex-none px-6 md:px-10 py-4 md:py-5 bg-white/5 rounded-2xl text-[10px] font-black uppercase border border-white/10 italic shadow-xl">관리자 도구</button>
            )}
            <button onClick={handleLogout} className="flex-1 sm:flex-none px-6 md:px-10 py-4 md:py-5 bg-red-600/10 border border-red-600/30 text-red-500 rounded-2xl text-[10px] font-black uppercase italic shadow-2xl hover:bg-red-600 hover:text-white transition-all tracking-[0.2em]">로그아웃</button>
          </div>
        </div>
      </div>

      {/* QR 모달 */}
      {selectedCoupon && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative bg-[#0a0a0a] border border-red-600/30 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] max-w-[400px] w-full text-center">
            <button onClick={() => setSelectedCoupon(null)} className="absolute top-6 right-6 md:top-8 md:right-8 w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all">
              <span className="text-gray-500 text-xl">✕</span>
            </button>
            <h3 className="text-xl md:text-2xl font-black text-white italic mb-2 uppercase">Coupon Auth</h3>
            <p className="text-gray-500 text-[9px] font-bold mb-8 italic">QR 저장 시 쿠폰은 즉시 사용 완료 처리됩니다.</p>
            <div ref={couponRef} className="bg-black p-6 md:p-8 rounded-[2rem] border border-white/5 mb-8 flex flex-col items-center">
              <p className="text-red-600 font-black italic text-xs mb-6 uppercase">{selectedCoupon.title}</p>
              <div className="bg-white p-3 md:p-4 rounded-2xl md:rounded-3xl mb-6 shadow-2xl">
                <QRCodeCanvas value={`${selectedCoupon.id}|${generatedSerial}`} size={160} level="H" />
              </div>
              <p className="text-white font-black text-base md:text-lg tracking-[0.2em] italic mb-2">{generatedSerial}</p>
              <p className="text-gray-600 text-[8px] font-bold uppercase italic">Owner: {currentUser.nickname}</p>
            </div>
            <button onClick={handleDownloadAndDispose} disabled={loading} className="w-full py-4 md:py-5 bg-red-600 text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase italic hover:bg-red-500 transition-all">
              {loading ? '처리 중...' : 'QR 저장 및 사용완료'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPage;
