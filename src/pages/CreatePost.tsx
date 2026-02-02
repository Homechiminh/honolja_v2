import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import type { Store } from '../types'; 
import { useAuth } from '../contexts/AuthContext';
import { useFetchGuard } from '../hooks/useFetchGuard';

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  
  // 1. 전역 인증 정보 구독
  const { currentUser, loading: authLoading, refreshUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]); 

  // 폼 상태 관리
  const [category, setCategory] = useState('free');
  const [subCategory, setSubCategory] = useState('시크릿 꿀정보'); 
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const isReviewAction = category === 'review' || (category === 'vip' && subCategory === '업소후기');

  /**
   * 🔴 [방탄 fetch] 업소 리스트 로드 (후기 작성용)
   * 에러가 나도 finally에서 dataLoading을 꺼주어 폼 입력을 방해하지 않습니다.
   */
  const fetchStores = async () => {
    setDataLoading(true);
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name')
        .range(0, 99);
      
      if (error) throw error;
      if (data) setStores(data as Store[]);
    } catch (err: any) {
      console.error("Store Archive Sync Failed (406 등):", err.message);
      setStores([]);
    } finally {
      setDataLoading(false);
    }
  };

  /**
   * 🔴 [데이터 가드 적용] 인증 확인 후 안전하게 업소 리스트 호출
   */
  useFetchGuard(fetchStores, []);

  // 이미지 업로드 로직 (방탄 구조 유지)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setLoading(true);
    const newUrls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const filePath = `post-images/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('posts').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('posts').getPublicUrl(filePath);
        newUrls.push(data.publicUrl);
      }
      setImageUrls(prev => [...prev, ...newUrls]);
    } catch (err: any) { 
      alert(`이미지 업로드 실패: ${err.message}`); 
    } finally { 
      setLoading(false); 
    }
  };

  /**
   * 🔴 [방탄 Submit] 게시글 생성 및 보상 지급 프로세스
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return alert('로그인이 필요합니다.');
    if (!title.trim() || !content.trim()) return alert('제목과 내용을 입력해주세요.');
    
    if (isReviewAction) {
      if (content.length < 50) return alert('업소 후기는 최소 50자 이상 작성해야 합니다.');
      if (!selectedStoreId) return alert('업소를 선택해 주세요.');
    }

    setLoading(true); // 발행 중 로딩 시작
    try {
      const finalTitle = category === 'qna' ? `[질문] ${title}` : title;
      
      // 1단계: 게시글 데이터베이스 삽입
      const { error: postError } = await supabase.from('posts').insert([{
        author_id: currentUser.id,
        title: finalTitle,
        content,
        category,
        sub_category: category === 'vip' ? subCategory : null, 
        store_id: isReviewAction ? selectedStoreId : null,
        image_urls: imageUrls || [], 
        link_url: linkUrl
      }]);

      if (postError) throw postError;

      // 2단계: 보상 포인트 계산
      const totalEarned = (isReviewAction ? 100 : 20) + (imageUrls.length > 0 ? 10 : 0);

      // 3단계: 프로필 업데이트 (포인트 및 리뷰수)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .update({
          points: (currentUser.points || 0) + totalEarned,
          review_count: (currentUser.review_count || 0) + (isReviewAction ? 1 : 0)
        })
        .eq('id', currentUser.id)
        .select().single();

      if (profileError) throw profileError;

      // 4단계: 포인트 히스토리 기록
      await supabase.from('point_history').insert([{
        user_id: currentUser.id,
        amount: totalEarned,
        reason: `${category === 'vip' ? `VIP ${subCategory}` : isReviewAction ? '업소후기' : '일반글'} 작성`
      }]);

      // 5단계: 등급 상승 체크 로직
      if (profile) {
        let newLevel = profile.level;
        if (profile.points >= 1000 && profile.review_count >= 8) newLevel = 4;
        else if (profile.points >= 300 && profile.review_count >= 3) newLevel = 3;
        else if (profile.points >= 100 && profile.review_count >= 1) newLevel = 2;

        if (newLevel > profile.level) {
          await supabase.from('profiles').update({ level: newLevel }).eq('id', currentUser.id);
          alert(`🎊 축하합니다! 등급이 ${newLevel}단계로 상승했습니다!`);
        }
      }

      await refreshUser(); // 전역 정보 즉시 동기화
      alert(`등록 완료! ${totalEarned}P 적립되었습니다.`);
      navigate(category === 'vip' ? '/vip-lounge' : '/community');

    } catch (err: any) { 
      console.error("Post Submission Error:", err.message);
      alert(`등록 실패: ${err.message}`); 
    } finally { 
      setLoading(false); // 어떤 에러가 나도 버튼 잠금 해제
    }
  };

  const inputStyle = "w-full bg-[#111] border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-red-600 outline-none transition-all placeholder:text-gray-800 font-medium italic shadow-inner";

  // 🔴 전체 인증 로딩 가드
  if (authLoading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-red-600 font-black animate-pulse tracking-[0.3em] uppercase text-xl italic">
        Syncing Post Engine...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans selection:bg-red-600/30">
      <div className="max-w-4xl mx-auto bg-[#0f0f0f] rounded-[3rem] p-10 md:p-16 border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600/50 to-transparent"></div>
        
        <h2 className="text-4xl font-black text-white italic mb-12 uppercase tracking-tighter leading-none">
          Create <span className="text-red-600">Post</span>
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in duration-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2 italic">Intelligence Sector</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputStyle}>
                <option value="free">자유게시판 (20P)</option>
                <option value="review">업소후기 (100P / 50자↑)</option>
                <option value="qna">질문/답변 (20P)</option>
                <option value="food">맛집/관광 (20P)</option>
                <option value="business">부동산/비즈니스 (20P)</option>
                {(currentUser?.level || 0) >= 3 && <option value="vip" className="text-yellow-500 font-bold">VIP 전용</option>}
              </select>
            </div>

            {category === 'vip' && (
              <div className="space-y-3 animate-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em] ml-2 italic">VIP Security Level</label>
                <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className={`${inputStyle} border-yellow-500/30 text-yellow-500`}>
                  <option value="시크릿 꿀정보">시크릿 꿀정보</option>
                  <option value="업소후기">업소후기 (VIP 전용)</option>
                  <option value="실시간 현황">실시간 현황</option>
                  <option value="블랙리스트">블랙리스트</option>
                </select>
              </div>
            )}

            {isReviewAction && (
              <div className="space-y-3 animate-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] ml-2 italic">Target Asset Selection</label>
                <select required value={selectedStoreId} onChange={(e) => setSelectedStoreId(e.target.value)} className={`${inputStyle} border-red-500/30 font-bold`}>
                  <option value="">대상 업소를 선택하세요 (필수)</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Headline" className={`${inputStyle} md:col-span-2 font-black text-xl`} />
            <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="External Link (Optional)" className={inputStyle} />
          </div>

          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12} placeholder="Type intelligence report here..." className={`${inputStyle} h-80 leading-relaxed resize-none font-medium italic`} />

          {/* 이미지 업로드 섹션 */}
          <div className="p-10 bg-black/40 rounded-[3rem] border border-white/5 shadow-inner group">
            <label className="text-[10px] font-black text-gray-500 uppercase block mb-6 tracking-widest italic border-l-2 border-red-600 pl-3">Intelligence Media (+10P Bonus)</label>
            <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="w-full text-xs text-gray-600 file:bg-red-600 file:text-white file:rounded-xl file:px-6 file:py-3 file:border-none cursor-pointer file:font-black file:uppercase file:mr-6 file:hover:bg-red-500 file:transition-all" />
            
            <div className="flex flex-wrap gap-4 mt-10">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative w-28 h-28 rounded-3xl overflow-hidden border border-white/10 group shadow-2xl">
                  <img src={url} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" alt="upload" />
                  <button type="button" onClick={() => setImageUrls(imageUrls.filter(u => u !== url))} className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 font-black transition-opacity text-xs italic">TERMINATE</button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-6 pt-6">
            <button type="button" onClick={() => navigate(-1)} className="flex-1 py-7 bg-white/5 text-gray-600 font-black rounded-[2rem] hover:bg-white/10 italic transition-all uppercase tracking-widest border border-white/5 shadow-xl">Discard</button>
            <button type="submit" disabled={loading} className="flex-[2] py-7 bg-red-600 text-white font-black rounded-[2rem] shadow-2xl shadow-red-900/30 hover:bg-red-500 transition-all uppercase italic text-2xl active:scale-95">
              {loading ? 'Transmitting Intelligence...' : 'Publish Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
