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

  // 🔴 1. 페이지 진입 시: 임시 저장된 데이터가 있는지 확인
  useEffect(() => {
    if (initialized) {
      const savedDraft = sessionStorage.getItem('post_create_draft');
      if (savedDraft) {
        const confirmed = window.confirm("작성 중이던 게시글이 있습니다. 불러올까요?");
        if (confirmed) {
          const data = JSON.parse(savedDraft);
          setCategory(data.category || 'free');
          setSubCategory(data.subCategory || '시크릿 꿀정보');
          setTitle(data.title || '');
          setContent(data.content || '');
          setSelectedStoreId(data.selectedStoreId || '');
          setLinkUrl(data.linkUrl || '');
        } else {
          sessionStorage.removeItem('post_create_draft');
        }
      }
    }
  }, [initialized]);

  // 🔴 2. 입력할 때마다 세션 스토리지에 자동 저장 (탭 전환/새로고침 대비)
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
    
    if (isReviewAction) {
      if (content.length < 50) return alert('🚨 업소 후기 최소 50자 이상 필수!');
      if (!selectedStoreId) return alert('🚨 대상 업소를 선택해주세요.');
    }

    setLoading(true);
    try {
      const finalTitle = category === 'qna' ? `[질문] ${title}` : title;
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

      // ✅ 등록 성공 시 임시 저장 데이터 삭제
      sessionStorage.removeItem('post_create_draft');

      const photoBonus = imageUrls.length > 0 ? 10 : 0;
      const totalEarned = (isReviewAction ? 100 : 20) + photoBonus;

      // 프로필 업데이트 및 레벨업 체크 로직 유지
      const { data: profile } = await supabase.from('profiles')
        .update({
          points: (currentUser.points || 0) + totalEarned,
          review_count: (currentUser.review_count || 0) + (isReviewAction ? 1 : 0)
        })
        .eq('id', currentUser.id)
        .select().single();

      await supabase.from('point_history').insert([{ 
        user_id: currentUser.id, 
        amount: totalEarned, 
        reason: `${category === 'vip' ? `VIP ${subCategory}` : isReviewAction ? '업소후기' : '일반글'} 작성` 
      }]);

      if (profile) {
        let newLevel = profile.level;
        if (profile.points >= 1000 && profile.review_count >= 8) newLevel = 4;
        else if (profile.points >= 300 && profile.review_count >= 3) newLevel = 3;
        else if (profile.points >= 100 && profile.review_count >= 1) newLevel = 2;
        if (newLevel > profile.level) await supabase.from('profiles').update({ level: newLevel }).eq('id', currentUser.id);
      }

      alert(`등록 완료! ${totalEarned}P가 적립되었습니다.`);

      // 최신 정보 갱신을 위해 window.location.href 사용 유지
      const targetPath = category === 'vip' ? '/vip-lounge' : '/community';
      window.location.href = targetPath; 

    } catch (err: any) { 
      alert(`등록 실패: ${err.message}`); 
      setLoading(false);
    }
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 italic">카테고리</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-red-600 transition-all">
                <option value="free">자유게시판</option>
                <option value="review">업소후기 (50자 필수 + 사진 10P 보너스)</option>
                <option value="qna">질문/답변</option>
                <option value="food">맛집/관광</option>
                <option value="business">부동산/비즈니스</option>
                {(currentUser?.level || 0) >= 3 && <option value="vip" className="text-yellow-500 font-bold">VIP 라운지</option>}
              </select>
            </div>
            {category === 'vip' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest ml-2 italic">VIP 소분류</label>
                <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="w-full bg-[#111] border border-yellow-500/30 rounded-2xl px-6 py-4 text-yellow-500 outline-none">
                  <option value="시크릿 꿀정보">시크릿 꿀정보</option>
                  <option value="업소후기">업소후기 (VIP 전용 + 10P 보너스)</option>
                  <option value="실시간 현황">실시간 현황</option>
                  <option value="블랙리스트">블랙리스트</option>
                </select>
              </div>
            )}
            {isReviewAction && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-2 italic">대상 업소 선택</label>
                <select required value={selectedStoreId} onChange={(e) => setSelectedStoreId(e.target.value)} className="w-full bg-[#111] border border-red-500/30 rounded-2xl px-6 py-4 text-white outline-none">
                  <option value="">업소를 선택하세요 (필수)</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 italic">제목</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력하세요" className="w-full bg-[#111] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold italic focus:border-red-600 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 italic">외부 링크 (선택)</label>
              <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="URL" className="w-full bg-[#111] border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-red-600 transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 italic">본문 내용</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12} placeholder="내용을 입력하세요..." className="w-full bg-[#111] border border-white/10 rounded-2xl px-6 py-4 text-white h-80 leading-relaxed resize-none italic focus:border-red-600 transition-all" />
          </div>
          
          <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 shadow-inner">
            <label className="text-[10px] font-black text-gray-500 uppercase block mb-4 tracking-widest italic">사진 첨부 (선택: +10P 보너스)</label>
            <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="w-full text-xs text-gray-500 file:bg-red-600 file:text-white file:rounded-lg file:px-4 file:py-2 file:border-none cursor-pointer file:font-black file:uppercase file:mr-4 hover:file:bg-red-700 transition-all" />
            <div className="flex flex-wrap gap-4 mt-8">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/10 group shadow-lg">
                  <img src={url} className="w-full h-full object-cover" alt="첨부 이미지" />
                  <button type="button" onClick={() => setImageUrls(imageUrls.filter(u => u !== url))} className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 font-black transition-opacity text-[10px]">삭제</button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => { sessionStorage.removeItem('post_create_draft'); navigate(-1); }} className="flex-1 py-6 bg-white/5 text-gray-500 font-black rounded-[1.5rem] hover:bg-white/10 italic transition-all tracking-widest border border-white/5">
              취소
            </button>
            <button type="submit" disabled={loading} className="flex-[2] py-6 bg-red-600 text-white font-black rounded-[1.5rem] shadow-2xl hover:bg-red-500 transition-all uppercase italic text-xl">
              {loading ? '등록 중...' : '등록 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
