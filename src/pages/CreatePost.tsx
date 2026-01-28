import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { User, Store } from '../types';

const CreatePost: React.FC<{ currentUser: User | null }> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<Store[]>([]); // 업소 선택용 리스트

  // 입력 필드 상태
  const [category, setCategory] = useState('free');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState(''); // 업소후기 시 필수
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // 1. 업소 리스트 미리 불러오기
  useEffect(() => {
    const fetchStores = async () => {
      const { data } = await supabase.from('stores').select('id, name').order('name');
      if (data) setStores(data);
    };
    fetchStores();
  }, []);

  // 2. 이미지 업로드 처리 (supabase storage: posts 버킷 필요)
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
    } catch (err) {
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 3. 게시글 등록 및 포인트 엔진 가동
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return alert('로그인 후 이용 가능합니다.');
    if (!title || !content) return alert('제목과 내용을 입력해주세요.');
    if (category === 'review' && !selectedStoreId) return alert('후기를 작성할 업소를 선택해주세요.');

    setLoading(true);

    try {
      // (1) 게시글 DB 저장
      const finalTitle = category === 'qna' ? `[질문] ${title}` : title;
      const { error: postError } = await supabase.from('posts').insert([{
        author_id: currentUser.id,
        title: finalTitle,
        content,
        category,
        store_id: category === 'review' ? selectedStoreId : null,
        image_urls: imageUrls,
        link_url: linkUrl
      }]);

      if (postError) throw postError;

      // (2) 포인트 계산 로직
      const isReview = category === 'review';
      const basePoints = isReview ? 100 : 20; // 후기 100P, 일반 20P
      const photoBonus = imageUrls.length > 0 ? 10 : 0; // 사진 보너스 10P
      const totalEarned = basePoints + photoBonus;

      // (3) 프로필 업데이트 (포인트 + 후기수)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .update({
          points: (currentUser.points || 0) + totalEarned,
          review_count: (currentUser.review_count || 0) + (isReview ? 1 : 0)
        })
        .eq('id', currentUser.id)
        .select().single();

      if (profileError) throw profileError;

      // (4) 포인트 가계부 기록
      await supabase.from('point_history').insert([{
        user_id: currentUser.id,
        amount: totalEarned,
        reason: `${isReview ? '업소후기' : '일반게시글'} 작성 보상 ${photoBonus > 0 ? '(사진보너스 포함)' : ''}`
      }]);

      // (5) 자동 등업 체크 (포인트/후기수 기준)
      if (profile) {
        let newLevel = profile.level;
        if (profile.points >= 1000 && profile.review_count >= 8) newLevel = 4; // VIP
        else if (profile.points >= 300 && profile.review_count >= 3) newLevel = 3; // 베테랑
        else if (profile.points >= 100 && profile.review_count >= 1) newLevel = 2; // 방랑자

        if (newLevel > profile.level) {
          await supabase.from('profiles').update({ level: newLevel }).eq('id', currentUser.id);
          alert(`🎊 축하합니다! 등급이 ${newLevel}단계로 올랐습니다!`);
        }
      }

      alert(`등록 완료! ${totalEarned}P가 적립되었습니다.`);
      navigate('/community');

    } catch (err: any) {
      alert('등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full bg-[#111] border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-red-600 outline-none transition-all";

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto bg-[#0f0f0f] rounded-[3rem] p-10 md:p-16 border border-white/5 shadow-2xl">
        <h2 className="text-4xl font-black text-white italic mb-10 uppercase tracking-tighter">
          Create <span className="text-red-600">New Post</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputStyle}>
                <option value="free">자유게시판 (20P)</option>
                <option value="review">📸 업소후기 (100P + 📷10P)</option>
                <option value="qna">🙋 질문/답변 (20P)</option>
                <option value="food">🍜 맛집/관광 (20P)</option>
                <option value="business">🏢 부동산/비즈니스 (20P)</option>
              </select>
            </div>

            {category === 'review' && (
              <div className="space-y-2 animate-in fade-in duration-500">
                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-2">Target Store</label>
                <select 
                  required
                  value={selectedStoreId} 
                  onChange={(e) => setSelectedStoreId(e.target.value)} 
                  className={`${inputStyle} border-emerald-500/30 text-emerald-500`}
                >
                  <option value="">후기를 남길 업소를 선택하세요</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력하세요" className={`${inputStyle} md:col-span-2 font-bold`} />
            <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="관련 링크 (Optional)" className={inputStyle} />
          </div>

          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12} placeholder="내용을 입력하세요..." className={`${inputStyle} resize-none h-80 leading-relaxed`} />

          {/* 이미지 첨부 */}
          <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 space-y-4">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Photo Attachment (Multiple)</label>
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
            <button type="submit" disabled={loading} className="flex-[2] py-8 bg-red-600 text-white font-black text-2xl rounded-[2.5rem] hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 uppercase italic">
              {loading ? 'Posting...' : 'Post Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
