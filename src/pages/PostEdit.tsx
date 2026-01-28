import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import type { User, Store } from '../types';

const PostEdit: React.FC<{ currentUser: User | null }> = ({ currentUser }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]);

  // 상태 관리
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, [id, currentUser]);

  const fetchInitialData = async () => {
    if (!id || !currentUser) return;
    setLoading(true);

    // 1. 업소 리스트 로드
    const { data: storeData } = await supabase.from('stores').select('*').order('name');
    if (storeData) setStores(storeData as Store[]);

    // 2. 기존 게시글 데이터 로드
    const { data: post, error } = await supabase.from('posts').select('*').eq('id', id).single();

    if (error || !post) {
      alert('게시글을 찾을 수 없습니다.');
      return navigate('/community');
    }

    // 🔴 권한 체크: 작성자 본인 혹은 관리자만 수정 가능
    if (post.author_id !== currentUser.id && currentUser.role !== 'ADMIN') {
      alert('수정 권한이 없습니다.');
      return navigate('/community');
    }

    // 데이터 세팅
    setCategory(post.category);
    setSubCategory(post.sub_category || '시크릿 꿀정보');
    setTitle(post.title);
    setContent(post.content);
    setSelectedStoreId(post.store_id || '');
    setImageUrls(post.image_urls || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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

      alert('수정되었습니다.');
      navigate(`/post/${id}`);
    } catch (err) {
      alert('수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full bg-[#111] border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-red-600 outline-none transition-all";

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white italic animate-pulse">LOADING POST DATA...</div>;

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto bg-[#0f0f0f] rounded-[3rem] p-10 md:p-16 border border-white/5 shadow-2xl">
        <h2 className="text-4xl font-black text-white italic mb-10 uppercase tracking-tighter">Edit <span className="text-red-600">Post</span></h2>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputStyle}>
              <option value="free">자유게시판</option>
              <option value="review">📸 업소후기</option>
              <option value="qna">🙋 질문/답변</option>
              <option value="food">🍜 맛집/관광</option>
              <option value="business">🏢 부동산/비즈니스</option>
              {currentUser?.level && currentUser.level >= 3 && <option value="vip" className="text-yellow-500 font-bold">👑 베테랑 전용</option>}
            </select>

            {category === 'vip' && (
              <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className={`${inputStyle} border-yellow-500/30 text-yellow-500`}>
                <option value="시크릿 꿀정보">💎 시크릿 꿀정보</option>
                <option value="업소후기">📸 업소후기 (VIP 전용)</option>
                <option value="VIP 혜택">🎁 VIP 혜택</option>
                <option value="블랙리스트">🚫 블랙리스트</option>
              </select>
            )}
          </div>

          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목" className={`${inputStyle} font-bold text-xl`} />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12} className={`${inputStyle} resize-none h-80`} />

          <div className="flex gap-4">
            <button type="button" onClick={() => navigate(-1)} className="flex-1 py-6 bg-white/5 text-gray-500 font-black rounded-2xl uppercase italic">Cancel</button>
            <button type="submit" disabled={loading} className="flex-[2] py-6 bg-red-600 text-white font-black text-xl rounded-2xl uppercase shadow-xl">Update Post</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostEdit;
