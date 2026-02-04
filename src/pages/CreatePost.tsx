import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../supabase';
import type { Store } from '../types'; 
import { useAuth } from '../contexts/AuthContext';
import { useFetchGuard } from '../hooks/useFetchGuard';

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, initialized } = useAuth();
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

  // 🔴 임시 저장 데이터 확인
  useEffect(() => {
    if (initialized) {
      const savedDraft = sessionStorage.getItem('post_create_draft');
      if (savedDraft) {
        setCategory(JSON.parse(savedDraft).category || 'free');
        setTitle(JSON.parse(savedDraft).title || '');
        setContent(JSON.parse(savedDraft).content || '');
      }
    }
  }, [initialized]);

  // 🔴 실시간 자동 저장
  useEffect(() => {
    if (initialized) {
      const draft = { category, subCategory, title, content, selectedStoreId, linkUrl };
      sessionStorage.setItem('post_create_draft', JSON.stringify(draft));
    }
  }, [category, subCategory, title, content, selectedStoreId, linkUrl, initialized]);

  const fetchStores = async () => {
    try {
      const { data } = await supabase.from('stores').select('*').order('name');
      if (data) setStores(data as Store[]);
    } catch (err) { console.error(err); }
  };

  useFetchGuard(fetchStores, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setLoading(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const filePath = `post-images/${fileName}`;
        await supabase.storage.from('posts').upload(filePath, file);
        const { data } = supabase.storage.from('posts').getPublicUrl(filePath);
        newUrls.push(data.publicUrl);
      }
      setImageUrls(prev => [...prev, ...newUrls]);
    } catch (err: any) { alert(`업로드 실패: ${err.message}`); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return alert('로그인이 필요합니다.');
    if (!title.trim() || !content.trim()) return alert('제목과 내용을 입력해주세요.');
    if (isReviewAction && content.length < 50) return alert('🚨 업소 후기 최소 50자 이상 필수!');

    setLoading(true);
    try {
      const finalTitle = category === 'qna' ? `[질문] ${title}` : title;
      const { error: postError } = await supabase.from('posts').insert([{
        author_id: currentUser.id, title: finalTitle, content, category,
        sub_category: category === 'vip' ? subCategory : null, 
        store_id: isReviewAction ? selectedStoreId : null,
        image_urls: imageUrls || [], link_url: linkUrl
      }]);

      if (postError) throw postError;
      sessionStorage.removeItem('post_create_draft');

      const photoBonus = imageUrls.length > 0 ? 10 : 0;
      const totalEarned = (isReviewAction ? 100 : 20) + photoBonus;

      // 🔴 레벨업 및 쿠폰 자동 지급 로직
      const { data: profile } = await supabase.from('profiles').update({
        points: (currentUser.points || 0) + totalEarned,
        review_count: (currentUser.review_count || 0) + (isReviewAction ? 1 : 0)
      }).eq('id', currentUser.id).select().single();

      await supabase.from('point_history').insert([{ user_id: currentUser.id, amount: totalEarned, reason: `${isReviewAction ? '업소후기' : '일반글'} 작성` }]);

      if (profile) {
        let newLevel = profile.level;
        if (profile.points >= 1000 && profile.review_count >= 8) newLevel = 4;
        else if (profile.points >= 300 && profile.review_count >= 3) newLevel = 3;
        else if (profile.points >= 100 && profile.review_count >= 1) newLevel = 2;
        
        if (newLevel > profile.level) {
          await supabase.from('profiles').update({ level: newLevel }).eq('id', currentUser.id);
          const couponName = `Lv.${newLevel} 등업 축하 쿠폰`;
          const couponAmount = newLevel === 4 ? 30000 : newLevel === 3 ? 10000 : 5000;
          await supabase.from('coupons').insert([{ user_id: currentUser.id, name: couponName, amount: couponAmount, status: 'available' }]);
          alert(`🎉 축하합니다! 등급이 Lv.${newLevel}로 상승하였으며 등업 축하 쿠폰이 지급되었습니다!`);
        }
      }

      alert(`등록 완료! ${totalEarned}P가 적립되었습니다.`);
      window.location.href = category === 'vip' ? '/vip-lounge' : '/community'; 
    } catch (err: any) { alert(`등록 실패: ${err.message}`); setLoading(false); }
  };

  if (!initialized) return null;

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans">
      <Helmet><title>호놀자 | 게시글 작성</title></Helmet>
      <div className="max-w-4xl mx-auto bg-[#0f0f0f] rounded-[3rem] p-10 md:p-16 border border-white/5 shadow-2xl">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Create <span className="text-red-600">Post</span></h2>
          <span className="text-[10px] text-emerald-500 font-bold animate-pulse italic">● 실시간 자동 저장 중</span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
          {/* ... 이하 원본 디자인 유지 ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 italic">카테고리</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-red-600 transition-all">
                <option value="free">자유게시판</option><option value="review">업소후기</option><option value="qna">질문/답변</option><option value="food">맛집/관광</option><option value="business">부동산/비즈니스</option>
                {(currentUser?.level || 0) >= 3 && <option value="vip" className="text-yellow-500 font-bold">VIP 라운지</option>}
              </select>
            </div>
          </div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력하세요" className="w-full bg-[#111] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold italic" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12} placeholder="내용을 입력하세요..." className="w-full bg-[#111] border border-white/10 rounded-2xl px-6 py-4 text-white h-80 leading-relaxed resize-none italic" />
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => { sessionStorage.removeItem('post_create_draft'); navigate(-1); }} className="flex-1 py-6 bg-white/5 text-gray-500 font-black rounded-2xl italic">취소</button>
            <button type="submit" disabled={loading} className="flex-[2] py-6 bg-red-600 text-white font-black rounded-2xl shadow-2xl hover:bg-red-500 transition-all uppercase italic text-xl">등록 완료</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
