import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { CategoryType, Region } from '../types';
import type { Store } from '../types';
import { useAuth } from '../contexts/AuthContext'; // 🔴 임포트 추가
import { useFetchGuard } from '../hooks/useFetchGuard'; // 🔴 임포트 추가

const CreatePost: React.FC = () => { // 🔴 프롭 제거
  const navigate = useNavigate();
  
  // 1. 전역 인증 정보 구독
  const { currentUser, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<Store[]>([]); 

  const [category, setCategory] = useState('free');
  const [subCategory, setSubCategory] = useState('시크릿 꿀정보'); 
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const isReviewAction = category === 'review' || (category === 'vip' && subCategory === '업소후기');

  // 🔴 [데이터 가드 적용] 인증이 완료된 후 업소 리스트를 가져옵니다.
  useFetchGuard(async () => {
    const { data } = await supabase
      .from('stores')
      .select('*')
      .order('name')
      .range(0, 99);
    if (data) setStores(data as Store[]);
  }, []);

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
      alert(`업로드 실패: ${err.message}`); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return alert('로그인이 필요합니다.');
    if (!title.trim() || !content.trim()) return alert('제목과 내용을 입력해주세요.');
    
    if (isReviewAction) {
      if (content.length < 50) return alert('업소 후기는 최소 50자 이상 작성해야 합니다.');
      if (!selectedStoreId) return alert('업소를 선택해 주세요.');
    }

    setLoading(true);
    try {
      const finalTitle = category === 'qna' ? `[질문] ${title}` : title;
      
      // 1. 게시글 등록
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

      // 2. 포인트 계산 (후기 100P / 일반 20P / 사진보너스 +10P)
      const totalEarned = (isReviewAction ? 100 : 20) + (imageUrls.length > 0 ? 10 : 0);

      // 3. 프로필 정보 갱신 및 포인트 지급
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .update({
          points: (currentUser.points || 0) + totalEarned,
          review_count: (currentUser.review_count || 0) + (isReviewAction ? 1 : 0)
        })
        .eq('id', currentUser.id)
        .select().single();

      if (profileError) throw profileError;

      // 4. 포인트 히스토리 기록
      await supabase.from('point_history').insert([{
        user_id: currentUser.id,
        amount: totalEarned,
        reason: `${category === 'vip' ? `VIP ${subCategory}` : isReviewAction ? '업소후기' : '일반글'} 작성`
      }]);

      // 5. 실시간 레벨업 체크
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

      alert(`등록 완료! ${totalEarned}P 적립되었습니다.`);
      navigate(category === 'vip' ? '/vip-lounge' : '/community');
    } catch (err: any) { 
      alert(`에러: ${err.message}`); 
    } finally { 
      setLoading(false); 
    }
  };

  const inputStyle = "w-full bg-[#111] border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-red-600 outline-none transition-all placeholder:text-gray-700";

  // 인증 정보 확인 중일 때의 로딩 처리
  if (authLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-red-600 font-black animate-pulse tracking-widest uppercase">
        Initializing Creator Studio...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans selection:bg-red-600/30">
      <div className="max-w-4xl mx-auto bg-[#0f0f0f] rounded-[3rem] p-10 md:p-16 border border-white/5 shadow-2xl">
        <h2 className="text-4xl font-black text-white italic mb-10 uppercase tracking-tighter">
          Create <span className="text-red-600">Post</span>
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputStyle}>
                <option value="free">자유게시판</option>
                <option value="review">업소후기 (50자 이상)</option>
                <option value="qna">질문/답변</option>
                <option value="food">맛집/관광</option>
                <option value="business">부동산/비즈니스</option>
                {(currentUser?.level || 0) >= 3 && <option value="vip" className="text-yellow-500 font-bold">VIP 라운지</option>}
              </select>
            </div>

            {category === 'vip' && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest ml-2">VIP Sub-Category</label>
                <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className={`${inputStyle} border-yellow-500/30 text-yellow-500`}>
                  <option value="시크릿 꿀정보">시크릿 꿀정보</option>
                  <option value="업소후기">업소후기 (VIP 전용)</option>
                  <option value="실시간 현황">실시간 현황</option>
                  <option value="블랙리스트">블랙리스트</option>
                </select>
              </div>
            )}

            {isReviewAction && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-2">Target Store Selection</label>
                <select required value={selectedStoreId} onChange={(e) => setSelectedStoreId(e.target.value)} className={`${inputStyle} border-red-500/30`}>
                  <option value="">대상 업소를 선택하세요 (필수)</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력하세요" className={`${inputStyle} md:col-span-2 font-bold`} />
            <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="외부 링크 (선택사항)" className={inputStyle} />
          </div>

          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12} placeholder="내용을 입력하세요..." className={`${inputStyle} h-80 leading-relaxed resize-none`} />

          <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 shadow-inner">
            <label className="text-[10px] font-black text-gray-500 uppercase block mb-4 tracking-widest italic">Photo Attachment (+10P Bonus)</label>
            <div className="relative group">
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="w-full text-xs text-gray-500 file:bg-red-600 file:text-white file:rounded-lg file:px-4 file:py-2 file:border-none cursor-pointer file:font-black file:uppercase file:italic file:mr-4" />
            </div>
            
            <div className="flex flex-wrap gap-4 mt-8">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/10 group shadow-lg">
                  <img src={url} className="w-full h-full object-cover" alt="upload" />
                  <button type="button" onClick={() => setImageUrls(imageUrls.filter(u => u !== url))} className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 font-black transition-opacity text-xs italic">DELETE</button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => navigate(-1)} className="flex-1 py-6 bg-white/5 text-gray-500 font-black rounded-[1.5rem] hover:bg-white/10 italic transition-all uppercase tracking-widest border border-white/5">CANCEL</button>
            <button type="submit" disabled={loading} className="flex-[2] py-6 bg-red-600 text-white font-black rounded-[1.5rem] shadow-2xl shadow-red-900/20 hover:bg-red-500 transition-all uppercase italic text-xl">
              {loading ? 'PROCESSING...' : 'PUBLISH POST'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
