import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { CategoryType, Region } from '../types';
import { useAuth } from '../contexts/AuthContext'; 
import { useFetchGuard } from '../hooks/useFetchGuard'; 

const AdminStoreEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // 1. 전역 인증 상태 구독
  const { loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: CategoryType.MASSAGE,
    region: Region.HCMC,
    address: '',
    description: '',
    image_url: '',
    promo_images: [] as string[],
    rating: 4.5,
    tags: '',
    benefits: '',
    kakao_url: '',
    telegram_url: '',
    is_hot: false
  });

  /**
   * 🔴 [방탄 fetch] 기존 업소 데이터 호출 로직
   * 서버 거절(406)이나 지연 시에도 finally 블록이 로딩을 확실히 끕니다.
   */
  const fetchStore = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('stores').select('*').eq('id', id).single();
      
      if (error) {
        // 🔴 데이터가 없거나 서버 응답 실패 시 catch로 던짐
        throw error;
      }

      if (data) {
        setFormData({
          name: data.name || '',
          category: data.category || CategoryType.MASSAGE,
          region: data.region || Region.HCMC,
          address: data.address || '',
          description: data.description || '',
          image_url: data.image_url || '',
          promo_images: data.promo_images || [],
          rating: data.rating ?? 4.5,
          tags: data.tags?.join(', ') || '',
          benefits: data.benefits?.join(', ') || '',
          kakao_url: data.kakao_url || '',
          telegram_url: data.telegram_url || '',
          is_hot: data.is_hot ?? false
        });
      }
    } catch (err: any) {
      console.error('Store Intelligence Load Error (406 등):', err.message);
      alert('업소 정보를 동기화할 수 없습니다.');
      navigate('/admin/manage-stores');
    } finally {
      // 🔴 핵심: 어떤 상황에서도 로딩 상태 해제
      setLoading(false);
    }
  };

  /**
   * 🔴 [데이터 가드 적용] 
   * 관리자 인증 확인이 완료된 최적의 타이밍에 데이터를 가져옵니다.
   */
  useFetchGuard(fetchStore, [id]);

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
        image_url: prev.image_url || newUrls[0]
      }));
    } catch (err: any) {
      alert(`이미지 업로드 실패: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  /**
   * 🔴 [방탄 Submit] 정보 수정 프로세스
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const updateData = {
        name: formData.name,
        category: formData.category,
        region: formData.region,
        address: formData.address,
        description: formData.description,
        image_url: formData.image_url,
        promo_images: formData.promo_images,
        rating: Number(formData.rating),
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
        benefits: formData.benefits.split(',').map(b => b.trim()).filter(b => b !== ''),
        kakao_url: formData.kakao_url,
        telegram_url: formData.telegram_url,
        is_hot: formData.is_hot
      };
      
      const { error: updateError } = await supabase.from('stores').update(updateData).eq('id', id);
      
      if (updateError) throw updateError;
      
      alert('업소 데이터가 성공적으로 수정되었습니다!');
      navigate('/admin/manage-stores');
    } catch (err: any) {
      console.error("Update Error:", err.message);
      alert('수정 중 에러가 발생했습니다. 필드 값을 확인하세요.');
    } finally {
      setUpdating(false);
    }
  };

  // 🔴 전체 로딩 가드 (인증 로딩 포함)
  if (authLoading || loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white italic animate-pulse font-black uppercase tracking-widest text-xl">
      Syncing Intelligence Archive...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans selection:bg-emerald-600/30">
      <div className="max-w-5xl mx-auto bg-[#111] rounded-[3.5rem] p-10 md:p-16 border border-white/5 shadow-2xl text-white animate-in fade-in duration-700">
        <header className="text-center mb-16">
          <h2 className="text-5xl font-black italic uppercase tracking-tighter inline-block border-b-8 border-emerald-500 pb-4 leading-none">
            Edit <span className="text-emerald-500">Store</span>
          </h2>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* 상단: HOT & 별점 설정 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-600/10 p-8 rounded-[2rem] border border-emerald-600/20 flex items-center justify-between shadow-inner">
              <p className="text-xl font-black text-emerald-500 italic uppercase tracking-tight">🔥 Hot Store Sector</p>
              <button type="button" onClick={() => setFormData({...formData, is_hot: !formData.is_hot})}
                className={`w-20 h-10 rounded-full relative transition-all duration-500 ${formData.is_hot ? 'bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-gray-800'}`}>
                <div className={`absolute top-1 w-8 h-8 bg-white rounded-full transition-all duration-300 ${formData.is_hot ? 'left-11' : 'left-1'}`} />
              </button>
            </div>
            <div className="bg-yellow-600/10 p-8 rounded-[2rem] border border-yellow-600/20 flex items-center justify-between shadow-inner">
              <p className="text-xl font-black text-yellow-500 italic uppercase tracking-tight">⭐ Authority Rating</p>
              <input type="number" step="0.1" value={formData.rating} 
                onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})} 
                className="w-24 bg-black text-yellow-500 text-center font-black text-2xl outline-none border-b-2 border-yellow-600 italic" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 italic">🏢 Store Title</label>
              <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-8 py-5 text-white outline-none focus:border-emerald-500 font-bold transition-all shadow-inner" />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 italic">📂 Industry Category</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value as any})} className="w-full bg-black border border-white/10 rounded-2xl px-8 py-5 text-white outline-none font-bold shadow-inner italic">
                {Object.values(CategoryType).map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
              </select>
            </div>

            {/* 사진 관리 갤러리 */}
            <div className="md:col-span-2 space-y-4">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 italic">🖼️ Interior Intelligence (Gallery)</label>
              <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 space-y-8 shadow-inner">
                <input type="file" multiple accept="image/*" onChange={handleMultipleImageUpload} 
                  className="w-full bg-black border border-white/10 rounded-2xl px-8 py-5 text-xs text-gray-500 file:mr-6 file:py-3 file:px-8 file:rounded-xl file:bg-emerald-600 file:text-white file:font-black file:uppercase file:border-none file:hover:bg-emerald-500 cursor-pointer shadow-xl" />
                
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6">
                  {formData.promo_images.map((url, idx) => (
                    <div key={idx} onClick={() => setFormData({...formData, image_url: url})}
                      className={`relative aspect-square rounded-[1.5rem] overflow-hidden cursor-pointer border-4 transition-all shadow-xl ${formData.image_url === url ? 'border-red-600 scale-105' : 'border-transparent opacity-40 hover:opacity-100'}`}>
                      <img src={url} className="w-full h-full object-cover" alt="gallery" />
                      <button type="button" onClick={(e) => {
                        e.stopPropagation();
                        setFormData({...formData, promo_images: formData.promo_images.filter(img => img !== url)});
                      }} className="absolute top-2 right-2 bg-black/80 text-white w-7 h-7 rounded-full text-[10px] flex items-center justify-center hover:bg-red-600 transition-colors">✕</button>
                      {formData.image_url === url && (
                        <div className="absolute inset-0 bg-red-600/10 flex items-center justify-center">
                          <span className="bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase italic tracking-tighter shadow-lg">Target Link</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
             <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 italic">📝 Classification Details</label>
             <textarea rows={8} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-black border border-white/10 rounded-[2.5rem] px-8 py-7 text-white outline-none focus:border-emerald-500 font-medium leading-relaxed resize-none italic shadow-inner" placeholder="Enter detailed intelligence report..." />
          </div>

          <div className="flex gap-6 pt-10">
            <button type="button" onClick={() => navigate('/admin/manage-stores')} className="flex-1 py-7 bg-white/5 text-gray-500 font-black text-xl rounded-[2.5rem] uppercase italic border border-white/5 hover:bg-white/10 transition-all active:scale-95">Cancel</button>
            <button type="submit" disabled={updating} className="flex-[2] py-7 bg-emerald-600 text-white font-black text-xl rounded-[2.5rem] shadow-2xl shadow-emerald-900/40 uppercase italic hover:bg-emerald-500 active:scale-95 transition-all">
              {updating ? 'Transmitting Data...' : 'Confirm Modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminStoreEdit;
