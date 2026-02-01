import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext'; 
import { useFetchGuard } from '../hooks/useFetchGuard'; // 🔴 신규 가드 훅 임포트
import type { Store } from '../types';

const PostEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // 1. 전역 인증 정보 가져오기
  const { currentUser, loading: authLoading } = useAuth(); 

  // 상태 관리
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);

  // 폼 상태 관리
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // 데이터 호출 및 권한 검증 로직
  const fetchInitialData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      // 1. 업소 리스트 로드
      const { data: storeData } = await supabase.from('stores').select('*').order('name');
      if (storeData) setStores(storeData as Store[]);

      // 2. 기존 게시글 데이터 로드
      const { data: post, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !post) {
        alert('게시글을 찾을 수 없습니다.');
        navigate('/community');
        return;
      }

      // 🔴 권한 체크: 인증이 완료된 확실한 유저 정보와 대조합니다.
      if (post.author_id !== currentUser?.id && currentUser?.role !== 'ADMIN') {
        alert('수정 권한이 없습니다.');
        navigate('/community');
        return;
      }

      // 데이터 매핑
      setCategory(post.category);
      setSubCategory(post.sub_category || '시크릿 꿀정보');
      setTitle(post.title);
      setContent(post.content);
      setSelectedStoreId(post.store_id || '');
      setImageUrls(post.image_urls || []);

    } catch (err) {
      console.error('Initial data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 🔴 [데이터 가드 적용] 
  // 기존의 복잡한 useEffect 대신 이 한 줄이 인증 대기 및 데이터 호출을 처리합니다.
  useFetchGuard(fetchInitialData, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return alert('제목과 내용을 입력해주세요.');
    
    if (category === 'vip' && (currentUser?.level || 0) < 3) {
      return alert('베테랑 등급만 작성이 가능합니다.');
    }

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

      alert('게시글이 수정되었습니다.');
      navigate(`/post/${id}`);
    } catch (err) {
      alert('수정 중 오류가 발생했습니다.');
    } finally {
      setUpdating(false);
    }
  };

  const inputStyle = "w-full bg-[#111] border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-red-600 outline-none transition-all placeholder:text-gray-700";

  // 🔴 전체 로딩 처리 (인증 확인 포함)
  if (authLoading || loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white font-black italic animate-pulse tracking-widest uppercase">
        Decrypting Post Data...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans selection:bg-red-600/30">
      <div className="max-w-4xl mx-auto bg-[#0f0f0f] rounded-[3rem] p-10 md:p-16 border border-white/5 shadow-2xl">
        <h2 className="text-4xl font-black text-white italic mb-10 uppercase tracking-tighter">
          Edit <span className="text-red-600">Post</span>
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 italic">Category</label>
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
                <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest ml-2 italic">VIP Sub-Category</label>
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
                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-2 italic">Target Store</label>
                <select 
                  required 
                  value={selectedStoreId} 
                  onChange={(e) => setSelectedStoreId(e.target.value)} 
                  className={`${inputStyle} border-emerald-500/30 text-emerald-500`}
                >
                  <option value="">업소를 선택하세요</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="제목을 입력하세요" 
              className={`${inputStyle} font-bold text-xl`} 
            />
            <textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              rows={12} 
              placeholder="내용을 입력하세요..."
              className={`${inputStyle} resize-none h-80 leading-relaxed`} 
            />
          </div>

          {imageUrls.length > 0 && (
            <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 shadow-inner">
              <label className="text-[10px] font-black text-gray-500 uppercase block mb-4 italic tracking-widest">Attached Images</label>
              <div className="flex flex-wrap gap-4">
                {imageUrls.map((url, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/10 group shadow-lg">
                    <img src={url} className="w-full h-full object-cover" alt="preview" />
                    <button 
                      type="button" 
                      onClick={() => setImageUrls(imageUrls.filter(u => u !== url))}
                      className="absolute inset-0 bg-red-600/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 font-black transition-opacity text-[10px] italic"
                    >
                      DELETE
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              className="flex-1 py-6 bg-white/5 text-gray-500 font-black rounded-2xl uppercase italic hover:bg-white/10 transition-all border border-white/5"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={updating} 
              className="flex-[2] py-6 bg-red-600 text-white font-black text-xl rounded-2xl uppercase shadow-2xl shadow-red-900/20 hover:bg-red-500 transition-all active:scale-95 italic"
            >
              {updating ? 'Updating...' : 'Update Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostEdit;
