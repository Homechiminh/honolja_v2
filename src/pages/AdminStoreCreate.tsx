import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { CategoryType, Region } from '../types';
import type { User } from '../types';

const AdminStoreCreate: React.FC<{ currentUser: User | null }> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: CategoryType.MASSAGE,
    region: Region.HCMC,
    address: '',
    description: '',
    image_url: '',
    promo_images: [] as string[],
    rating: 4.5,
    image_index: 0,
    tags: '',
    benefits: '',
    kakao_url: '',
    telegram_url: '',
    is_hot: false
  });

  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
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

      setFormData(prev => {
        const updatedPromo = [...prev.promo_images, ...newUrls];
        return { 
          ...prev, 
          promo_images: updatedPromo,
          image_url: prev.image_url || newUrls[0] 
        };
      });
    } catch (err) {
      alert('이미지 업로드 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) return alert('최소 한 장 이상의 이미지를 업로드하세요.');
    setLoading(true);
    
    try {
      // 🔴 데이터 로드 안정화: author_id를 명시적으로 currentUser에서 가져옴
      const { error } = await supabase.from('stores').insert([{
        ...formData,
        rating: Number(formData.rating),
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
        benefits: formData.benefits.split(',').map(b => b.trim()).filter(b => b !== ''),
        author_id: currentUser?.id 
      }]);

      if (error) throw error;
      alert('새 업소 등록 완료!');
      navigate('/admin/manage-stores');
    } catch (err) {
      alert('등록 실패');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full bg-[#1c1c1c] border-2 border-[#333] rounded-2xl px-6 py-5 text-lg font-bold text-white focus:border-red-600 focus:bg-black outline-none transition-all shadow-md";
  const labelStyle = "text-sm font-black text-gray-400 uppercase tracking-widest ml-2 mb-2 block";

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans">
      <div className="max-w-5xl mx-auto bg-[#111] rounded-[3.5rem] p-8 md:p-16 border border-white/5 shadow-2xl">
        <header className="text-center mb-16">
          <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter inline-block border-b-8 border-red-600 pb-4">
            New <span className="text-red-600">Store</span>
          </h2>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#1c1c1c] p-8 rounded-[2.5rem] border-2 border-[#333] flex items-center justify-between">
              <p className="text-xl font-black text-red-500 italic uppercase">🔥 Hot Store</p>
              <button type="button" onClick={() => setFormData({...formData, is_hot: !formData.is_hot})}
                className={`w-20 h-10 rounded-full relative transition-all duration-300 ${formData.is_hot ? 'bg-red-600' : 'bg-gray-700'}`}>
                <div className={`absolute top-1 w-8 h-8 bg-white rounded-full transition-all ${formData.is_hot ? 'left-11' : 'left-1'}`} />
              </button>
            </div>

            <div className="bg-[#1c1c1c] p-8 rounded-[2.5rem] border-2 border-[#333] flex items-center justify-between">
              <p className="text-xl font-black text-yellow-500 italic uppercase">⭐ Rating</p>
              <input type="number" step="0.1" min="0" max="5" value={formData.rating}
                onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
                className="w-24 bg-black text-yellow-500 text-center font-black text-2xl outline-none border-b-2 border-yellow-600" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className={labelStyle}>🏢 업소/숙소 명</label>
              <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={inputStyle} placeholder="상호를 입력하세요" />
            </div>
            <div>
              <label className={labelStyle}>📂 카테고리</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value as any})} className={inputStyle}>
                {Object.values(CategoryType).map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
              </select>
            </div>

            <div className="md:col-span-2 space-y-4">
              <label className={labelStyle}>🖼️ 갤러리 사진 등록 (여러 장 선택 가능)</label>
              <input type="file" multiple accept="image/*" onChange={handleMultipleImageUpload} className={inputStyle} />
              
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
                {formData.promo_images.map((url, idx) => (
                  <div key={idx} onClick={() => setFormData({...formData, image_url: url})}
                    className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-4 transition-all ${formData.image_url === url ? 'border-red-600 scale-105 shadow-lg shadow-red-600/20' : 'border-transparent opacity-40 hover:opacity-100'}`}
                  >
                    <img src={url} className="w-full h-full object-cover" alt="preview" />
                    {formData.image_url === url && (
                      <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center">
                        <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded italic">MAIN</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-black text-yellow-500 uppercase tracking-widest ml-2 mb-2 block">💬 Kakao Link</label>
              <input value={formData.kakao_url} onChange={(e) => setFormData({...formData, kakao_url: e.target.value})} className={inputStyle} placeholder="https://open.kakao.com/..." />
            </div>
            <div>
              <label className="text-sm font-black text-blue-500 uppercase tracking-widest ml-2 mb-2 block">✈️ Telegram Link</label>
              <input value={formData.telegram_url} onChange={(e) => setFormData({...formData, telegram_url: e.target.value})} className={inputStyle} placeholder="https://t.me/..." />
            </div>
          </div>

          <div>
            <label className={labelStyle}>📝 상세 설명</label>
            <textarea rows={5} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className={`${inputStyle} h-40 resize-none`} placeholder="업소 상세 정보를 입력하세요." />
          </div>

          <button type="submit" disabled={loading || !formData.image_url} className="w-full py-8 bg-red-600 text-white font-black text-2xl rounded-[2.5rem] hover:bg-red-700 transition-all shadow-xl uppercase italic disabled:opacity-50">
            {loading ? 'Processing...' : '새 업소 등록 완료'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminStoreCreate;
