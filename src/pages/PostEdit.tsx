import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext'; 
import { useFetchGuard } from '../hooks/useFetchGuard'; 
import type { Store } from '../types';

const PostEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { currentUser, loading: authLoading, initialized } = useAuth(); 

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);

  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const fetchInitialData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data: storeData } = await supabase.from('stores').select('*').order('name');
      if (storeData) setStores(storeData as Store[]);

      const { data: post } = await supabase.from('posts').select('*').eq('id', id).single();

      if (!post) {
        alert('게시글을 찾을 수 없습니다.');
        navigate('/community');
        return;
      }

      if (post.author_id !== currentUser?.id && currentUser?.role !== 'ADMIN') {
        alert('수정 권한이 없습니다.');
        navigate('/community');
        return;
      }

      // 🔴 임시 저장 데이터 확인
      const savedDraft = sessionStorage.getItem(`post_edit_draft_${id}`);
      if (savedDraft) {
        const confirmed = window.confirm("작성 중이던 임시 저장 내용이 있습니다. 불러올까요?");
        if (confirmed) {
          const data = JSON.parse(savedDraft);
          setCategory(data.category);
          setSubCategory(data.subCategory);
          setTitle(data.title);
          setContent(data.content);
          setSelectedStoreId(data.selectedStoreId);
          setImageUrls(data.imageUrls);
          setLoading(false);
          return;
        } else {
          sessionStorage.removeItem(`post_edit_draft_${id}`);
        }
      }

      setCategory(post.category);
      setSubCategory(post.sub_category || '시크릿 꿀정보');
      setTitle(post.title);
      setContent(post.content);
      setSelectedStoreId(post.store_id || '');
      setImageUrls(post.image_urls || []);

    } catch (err: any) {
      console.error('Post Data Sync Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useFetchGuard(fetchInitialData, [id]);

  // 🔴 실시간 임시 저장 (탭 전환 대비)
  useEffect(() => {
    if (!loading && id && initialized) {
      const draft = { category, subCategory, title, content, selectedStoreId, imageUrls };
      sessionStorage.setItem(`post_edit_draft_${id}`, JSON.stringify(draft));
    }
  }, [category, subCategory, title, content, selectedStoreId, imageUrls, loading, id, initialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return alert('제목과 내용을 입력해주세요.');
    
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          title,
          content,
          category,
          sub_category: category === 'vip' ? subCategory : null,
          store_id: category === 'review' ? selectedStoreId : null,
          image_urls: imageUrls
        })
        .eq('id', id);

      if (error) throw error;

      sessionStorage.removeItem(`post_edit_draft_${id}`);
      alert('게시글이 성공적으로 수정되었습니다.');
      navigate(`/post/${id}`);
    } catch (err) {
      alert('수정 중 오류가 발생했습니다.');
    } finally {
      setUpdating(false);
    }
  };

  const inputStyle = "w-full bg-[#111] border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-red-600 outline-none transition-all placeholder:text-gray-700 font-medium";

  // 🔴 튕김 방지용 조건부 렌더링: 데이터가 이미 로드된 상태라면 탭 전환 시 loading 화면을 띄우지 않음
  if ((!initialized && authLoading) || (loading && !category)) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white font-black italic animate-pulse tracking-widest uppercase text-xl">
        데이터 동기화 중...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans selection:bg-red-600/30">
      <div className="max-w-4xl mx-auto bg-[#0f0f0f] rounded-[3rem] p-10 md:p-16 border border-white/5 shadow-2xl">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
            Edit <span className="text-red-600">Post</span>
          </h2>
          <span className="text-[10px] text-emerald-500 font-bold animate-pulse">● 실시간 자동 저장 중</span>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 italic">카테고리</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputStyle}>
                <option value="free">자유게시판</option>
                <option value="review">📸 업소후기</option>
                <option value="qna">🙋 질문/답변</option>
                <option value="food">🍜 맛집/관광</option>
                <option value="business">🏢 부동산/비즈니스</option>
                {(currentUser?.level || 0) >= 3 && (
                  <option value="vip" className="text-yellow-500 font-bold">👑 베테랑 전용</option>
                )}
              </select>
            </div>

            {category === 'vip' && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest ml-2 italic">VIP 소분류</label>
                <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className={`${inputStyle} border-yellow-500/30 text-yellow-500`}>
                  <option value="시크릿 꿀정보">💎 시크릿 꿀정보</option>
                  <option value="업소후기">📸 업소후기 (VIP 전용)</option>
                  <option value="VIP 혜택">🎁 VIP 혜택</option>
                  <option value="블랙리스트">🚫 블랙리스트</option>
                </select>
              </div>
            )}

            {category === 'review' && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-2 italic">대상 업소</label>
                <select required value={selectedStoreId} onChange={(e) => setSelectedStoreId(e.target.value)} className={`${inputStyle} border-emerald-500/30 text-emerald-500 font-bold`}>
                  <option value="">업소를 선택하세요</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력하세요" className={`${inputStyle} font-black text-xl italic`} />
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12} placeholder="내용을 입력하세요..." className={`${inputStyle} resize-none h-80 leading-relaxed font-medium italic`} />
          </div>

          <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 shadow-inner">
            <label className="text-[10px] font-black text-gray-500 uppercase block mb-4 italic tracking-widest">첨부 이미지</label>
            <div className="flex flex-wrap gap-4">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/10 group shadow-lg">
                  <img src={url} className="w-full h-full object-cover" alt="preview" />
                  <button type="button" onClick={() => setImageUrls(imageUrls.filter(u => u !== url))} className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 font-black transition-opacity text-[10px] italic">삭제</button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => { sessionStorage.removeItem(`post_edit_draft_${id}`); navigate(-1); }} className="flex-1 py-6 bg-white/5 text-gray-400 font-black rounded-2xl uppercase italic hover:bg-white/10 transition-all border border-white/5">취소</button>
            <button type="submit" disabled={updating} className="flex-[2] py-6 bg-red-600 text-white font-black text-xl rounded-2xl uppercase shadow-2xl hover:bg-red-500 transition-all active:scale-95 italic">게시글 수정</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostEdit;
