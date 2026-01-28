import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import type { User, Store } from '../types';

const CreatePost: React.FC<{ currentUser: User | null }> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<Store[]>([]); 

  const [category, setCategory] = useState('free');
  // 🔴 추가: VIP 세부 카테고리 상태
  const [subCategory, setSubCategory] = useState('시크릿 꿀정보'); 
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    const fetchStores = async () => {
      const { data } = await supabase.from('stores').select('*').order('name');
      if (data) setStores(data as Store[]);
    };
    fetchStores();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setLoading(true);
    const newUrls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const fileName = `${Date.now()}_post_${Math.random().toString(36).substring(7)}`;
        const { error: uploadError } = await supabase.storage.from('posts').upload(`post-images/${fileName}`, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('posts').getPublicUrl(`post-images/${fileName}`);
        newUrls.push(data.publicUrl);
      }
      setImageUrls(prev => [...prev, ...newUrls]);
    } catch (err) {
      alert('이미지 업로드 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return alert('로그인이 필요합니다.');
    if (!title || !content) return alert('제목과 내용을 입력해주세요.');
    
    // 🔴 보안 강화: 베테랑 권한 Hard Guard
    if (category === 'vip' && currentUser.level < 3) {
      alert('베테랑 등급만 작성이 가능합니다.');
      return;
    }
    if (category === 'review' && !selectedStoreId) return alert('후기를 남길 업소를 선택해주세요.');

    setLoading(true);

    try {
      const finalTitle = category === 'qna' ? `[질문] ${title}` : title;
      const { error: postError } = await supabase.from('posts').insert([{
        author_id: currentUser.id,
        title: finalTitle,
        content,
        category,
        // 🔴 추가: sub_category 저장
        sub_category: category === 'vip' ? subCategory : null, 
        store_id: category === 'review' ? selectedStoreId : null,
        image_urls: imageUrls,
        link_url: linkUrl
      }]);

      if (postError) throw postError;

      // 포인트 정책: 후기 100P, 일반 20P, 사진보너스 10P
      const isReview = category === 'review';
      const basePoints = isReview ? 100 : 20;
      const photoBonus = imageUrls.length > 0 ? 10 : 0;
      const totalEarned = basePoints + photoBonus;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .update({
          points: (currentUser.points || 0) + totalEarned,
          review_count: (currentUser.review_count || 0) + (isReview ? 1 : 0)
        })
        .eq('id', currentUser.id)
        .select().single();

      if (profileError) throw profileError;

      await supabase.from('point_history').insert([{
        user_id: currentUser.id,
        amount: totalEarned,
        reason: `${category === 'vip' ? 'VIP 정보' : isReview ? '업소후기' : '일반게시글'} 작성 ${photoBonus > 0 ? '(사진보너스)' : ''}`
      }]);

      if (profile) {
        let newLevel = profile.level;
        if (profile.points >= 1000 && profile.review_count >= 8) newLevel = 4;
        else if (profile.points >= 300 && profile.review_count >= 3) newLevel = 3;
        else if (profile.points >= 100 && profile.review_count >= 1) newLevel = 2;

        if (newLevel > profile.level) {
          await supabase.from('profiles').update({ level: newLevel }).eq('id', currentUser.id);
          alert(`🎊 등급이 ${newLevel}단계로 상승했습니다!`);
        }
      }

      alert(`등록 완료! ${totalEarned}P 적립되었습니다.`);
      navigate(category === 'vip' ? '/vip-lounge' : '/community');

    } catch (err: any) {
      alert('등록 중 에러가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full bg-[#111] border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-red-600 outline-none transition-all";

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto bg-[#0f0f0f] rounded-[3rem] p-10 md:p-16 border border-white/5 shadow-2xl">
        <h2 className="text-4xl font-black text-white italic mb-10 uppercase tracking-tighter">
          Create <span className="text-red-600">Post</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputStyle}>
                <option value="free">자유게시판 (20P)</option>
                <option value="review">📸 업소후기 (100P + 📷10P)</option>
                <option value="qna">🙋 질문/답변 (20P)</option>
                <option value="food">🍜 맛집/관광 (20P)</option>
                <option value="business">🏢 부동산/비즈니스 (20P)</option>
                {currentUser && currentUser.level >= 3 && (
                  <option value="vip" className="text-yellow-500 font-bold">👑 베테랑 전용 정보 (20P)</option>
                )}
              </select>
            </div>

            {/* 🔴 추가: VIP 선택 시 나타나는 세부 카테고리 */}
            {category === 'vip' && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest ml-2">VIP Sub-Category</label>
                <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className={`${inputStyle} border-yellow-500/30 text-yellow-500`}>
                  <option value="시크릿 꿀정보">💎 시크릿 꿀정보</option>
                  <option value="업소후기">📸 업소후기 (VIP 전용)</option>
                  <option value="VIP 혜택">🎁 VIP 혜택</option>
                  <option value="블랙리스트">🚫 블랙리스트</option>
                </select>
              </div>
            )}

            {category === 'review' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-2">Target Store</label>
                <select required value={selectedStoreId} onChange={(e) => setSelectedStoreId(e.target.value)} className={`${inputStyle} border-emerald-500/30 text-emerald-500`}>
                  <option value="">후기를 남길 업소를 선택하세요</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
          </div>
          {/* ... 이하 제목/본문/사진 필드 동일 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력하세요" className={`${inputStyle} md:col-span-2 font-bold`} />
            <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="외부 링크 (Optional)" className={inputStyle} />
          </div>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12} placeholder="내용을 입력하세요..." className={`${inputStyle} resize-none h-80 leading-relaxed`} />
          
          {/* 사진 첨부 영역 */}
          <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 space-y-4">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Photo Attachment</label>
            <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-gray-500 file:mr-6 file:py-3 file:px-8 file:rounded-xl file:border-0 file:bg-red-600 file:text-white cursor-pointer" />
            <div className="flex flex-wrap gap-4 mt-4">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden group border border-white/10">
                  <img src={url} className="w-full h-full object-cover" alt="prev" />
                  <button type="button" onClick={() => setImageUrls(imageUrls.filter(u => u !== url))} className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold">삭제</button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-10">
            <button type="button" onClick={() => navigate(-1)} className="flex-1 py-8 bg-white/5 text-gray-500 font-black text-xl rounded-[2.5rem] uppercase italic">Cancel</button>
            <button type="submit" disabled={loading} className="flex-[2] py-8 bg-red-600 text-white font-black text-2xl rounded-[2.5rem] hover:bg-red-700 shadow-xl">
              {loading ? 'Posting...' : 'Post Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
