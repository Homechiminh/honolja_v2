import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { CategoryType, Region } from '../types';
import type { User } from '../types';

const AdminStoreEdit: React.FC<{ currentUser: User | null }> = ({ currentUser }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: CategoryType.MASSAGE,
    region: Region.HCMC,
    address: '',
    description: '',
    image_url: '',       // 대표 이미지 URL
    promo_images: [] as string[], // 🔴 다중 이미지 배열
    rating: 4.5,
    tags: '',
    benefits: '',
    kakao_url: '',
    telegram_url: '',
    is_hot: false
  });

  useEffect(() => {
    const fetchStore = async () => {
      const { data, error } = await supabase.from('stores').select('*').eq('id', id).single();
      if (!error && data) {
        setFormData({
          ...data,
          tags: data.tags?.join(', ') || '',
          benefits: data.benefits?.join(', ') || '',
          rating: data.rating || 4.5,
          promo_images: data.promo_images || [] // 🔴 DB에서 다중 이미지 로드
        });
      }
      setLoading(false);
    };
    fetchStore();
  }, [id]);

  if (currentUser?.role !== 'ADMIN') {
    navigate('/');
    return null;
  }

  // 🔴 다중 이미지 업로드 핸들러
  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUpdating(true);
    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const filePath = `store-images/${fileName}`;
        
        const { error: uploadError } = await supabase.storage.from('stores').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('stores').getPublicUrl(filePath);
        newUrls.push(data.publicUrl);
      }

      setFormData(prev => ({
        ...prev,
        promo_images: [...prev.promo_images, ...newUrls],
        image_url: prev.image_url || newUrls[0] // 메인이 없으면 첫 장 자동 지정
      }));
    } catch (err) {
      alert('이미지 업로드 실패');
    } finally {
      setUpdating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('stores')
        .update({
          ...formData,
          rating: Number(formData.rating),
          tags: formData.tags.split(',').map((t) => t.trim()).filter(t => t !== ''),
          benefits: formData.benefits.split(',').map((b) => b.trim()).filter(b => b !== '')
        })
        .eq('id', id);
      
      if (error) throw error;
      alert('업소 정보가 성공적으로 수정되었습니다!');
      navigate('/admin/manage-stores');
    } catch (err) {
      alert('수정 중 에러가 발생했습니다.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white italic animate-pulse tracking-widest uppercase">Loading Store Data...</div>;

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans">
      <div className="max-w-5xl mx-auto bg-[#111] rounded-[3.5rem] p-10 md:p-16 border border-white/5 shadow-2xl">
        <header className="text-center mb-16">
          <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter inline-block border-b-8 border-emerald-500 pb-4">
            Edit <span className="text-emerald-500">Store</span>
          </h2>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* HOT & 별점 관리 섹션 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-600/10 p-8 rounded-[2rem] border border-emerald-600/20 flex items-center justify-between">
              <p className="text-xl font-black text-emerald-500 italic uppercase">🔥 Hot Store Setting</p>
              <button type="button" onClick={() => setFormData({...formData, is_hot: !formData.is_hot})}
                className={`w-20 h-10 rounded-full relative transition-all duration-300 ${formData.is_hot ? 'bg-emerald-600' : 'bg-gray-800'}`}>
                <div className={`absolute top-1 w-8 h-8 bg-white rounded-full transition-all ${formData.is_hot ? 'left-11' : 'left-1'}`} />
              </button>
            </div>

            <div className="bg-yellow-600/10 p-8 rounded-[2rem] border border-yellow-600/20 flex items-center justify-between">
              <p className="text-xl font-black text-yellow-500 italic uppercase">⭐ Star Rating</p>
              <input type="number" step="0.1" min="0" max="5" value={formData.rating} 
                onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})} 
                className="w-24 bg-black text-yellow-500 text-center font-black text-2xl outline-none border-b-2 border-yellow-600" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-2">🏢 업소/숙소 명</label>
              <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-8 py-5 text-white outline-none focus:border-emerald-500" />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-2">📂 카테고리</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value as any})} className="w-full bg-black border border-white/10 rounded-2xl px-8 py-5 text-white outline-none">
                {Object.values(CategoryType).map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
              </select>
            </div>

            {/* 🔴 다중 이미지 관리 섹션 */}
            <div className="md:col-span-2 space-y-4">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-2">🖼️ 갤러리 및 대표 이미지 관리</label>
              <div className="p-6 bg-black/40 rounded-[2.5rem] border border-white/5 space-y-6">
                <input type="file" multiple accept="image/*" onChange={handleMultipleImageUpload} 
                  className="w-full bg-black border border-white/10 rounded-2xl px-8 py-5 text-sm text-gray-500 file:mr-6 file:py-3 file:px-8 file:rounded-xl file:bg-emerald-600 file:text-white cursor-pointer" />
                
                {/* 🔴 이미지 타일 리스트 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {formData.promo_images.map((url, idx) => (
                    <div key={idx} onClick={() => setFormData({...formData, image_url: url})}
                      className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-4 transition-all ${formData.image_url === url ? 'border-red-600 scale-105' : 'border-transparent opacity-40 hover:opacity-100'}`}>
                      <img src={url} className="w-full h-full object-cover" alt="gallery" />
                      {formData.image_url === url && (
                        <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center">
                          <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded italic uppercase">Main</span>
                        </div>
                      )}
                      <button type="button" onClick={(e) => {
                        e.stopPropagation();
                        setFormData({...formData, promo_images: formData.promo_images.filter(img => img !== url)});
                      }} className="absolute top-2 right-2 bg-black/80 text-white w-6 h-6 rounded-full text-[10px] hover:bg-red-600">✕</button>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-500 font-bold italic uppercase">* 이미지를 클릭하여 [대표 이미지]를 설정하세요.</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-black text-yellow-500 uppercase tracking-widest ml-2">💬 Kakaotalk Link</label>
              <input value={formData.kakao_url} onChange={(e) => setFormData({...formData, kakao_url: e.target.value})} className="w-full bg-black border border-yellow-600/30 rounded-2xl px-8 py-5 text-white outline-none focus:border-yellow-500" />
            </div>
            <div className="space-y-4">
              <label className="text-sm font-black text-blue-500 uppercase tracking-widest ml-2">✈️ Telegram Link</label>
              <input value={formData.telegram_url} onChange={(e) => setFormData({...formData, telegram_url: e.target.value})} className="w-full bg-black border border-blue-600/30 rounded-2xl px-8 py-5 text-white outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="space-y-8 pt-8 border-t border-white/5">
            <div className="space-y-4">
              <label className="text-sm font-black text-red-500 uppercase tracking-widest ml-2">🎁 제휴 혜택</label>
              <input value={formData.benefits} onChange={(e) => setFormData({...formData, benefits: e.target.value})} className="w-full bg-black border border-red-600/30 rounded-2xl px-8 py-5 text-white outline-none" placeholder="10% 할인, 무료 음료 등" />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-2">📝 업소 상세 설명</label>
              <textarea rows={6} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-black border border-white/10 rounded-[2.5rem] px-8 py-8 text-white outline-none focus:border-emerald-500 resize-none leading-relaxed" />
            </div>
          </div>

          <div className="flex gap-4 pt-10">
            <button type="button" onClick={() => navigate('/admin/manage-stores')} className="flex-1 py-8 bg-white/5 text-gray-400 font-black text-2xl rounded-[2.5rem] uppercase italic border border-white/5">취소</button>
            <button type="submit" disabled={updating} className="flex-[2] py-8 bg-emerald-600 text-white font-black text-2xl rounded-[2.5rem] shadow-2xl uppercase italic tracking-tighter hover:bg-emerald-700">
              {updating ? 'Updating...' : '수정 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminStoreEdit;
