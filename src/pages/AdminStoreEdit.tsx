import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { CategoryType, Region, UserRole } from '../types'; 
import { useAuth } from '../contexts/AuthContext'; 
import { useFetchGuard } from '../hooks/useFetchGuard'; 

const AdminStoreEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, initialized } = useAuth();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: CategoryType.MASSAGE,
    region: Region.HCMC,
    address: '',
    lat: '',
    lng: '',
    description: '',
    image_url: '',
    promo_images: [] as string[],
    rating: 4.5,
    tags: '', 
    benefits: '',
    price: '',    
    kakao_url: '',
    telegram_url: '',
    is_hot: false
  });

  useEffect(() => {
    if (initialized) {
      if (!currentUser || currentUser.role !== UserRole.ADMIN) {
        navigate('/', { replace: true });
      }
    }
  }, [initialized, currentUser, navigate]);

  const handleFetchCoords = async () => {
    if (!formData.address) return alert('주소를 먼저 입력해주세요.');
    setGeoLoading(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(formData.address)}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.status === 'OK') {
        const { lat, lng } = data.results[0].geometry.location;
        setFormData(prev => ({ ...prev, lat: lat.toString(), lng: lng.toString() }));
        alert('좌표 갱신 완료!');
      }
    } catch (err) {
      alert('오류 발생');
    } finally {
      setGeoLoading(false);
    }
  };

  const fetchStore = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('stores').select('*').eq('id', id).single();
      if (error) throw error;
      if (data) {
        setFormData({
          name: data.name || '',
          category: data.category || CategoryType.MASSAGE,
          region: data.region || Region.HCMC,
          address: data.address || '',
          lat: data.lat?.toString() || '',
          lng: data.lng?.toString() || '',
          description: data.description || '',
          image_url: data.image_url || '',
          promo_images: data.promo_images || [],
          rating: data.rating ?? 4.5,
          tags: Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || ''),
          benefits: Array.isArray(data.benefits) ? data.benefits.join(', ') : (data.benefits || ''),
          price: data.price || '', 
          kakao_url: data.kakao_url || '',
          telegram_url: data.telegram_url || '',
          is_hot: data.is_hot ?? false
        });
      }
    } catch (err: any) {
      navigate('/admin/manage-stores');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

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
        await supabase.storage.from('stores').upload(filePath, file);
        const { data } = supabase.storage.from('stores').getPublicUrl(filePath);
        newUrls.push(data.publicUrl);
      }
      setFormData(prev => ({ ...prev, promo_images: [...prev.promo_images, ...newUrls], image_url: prev.image_url || newUrls[0] }));
    } catch (err: any) {
      alert('업로드 실패');
    } finally {
      setUpdating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const updateData = {
        name: formData.name,
        category: formData.category,
        region: formData.region,
        address: formData.address,
        lat: formData.lat ? Number(formData.lat) : null,
        lng: formData.lng ? Number(formData.lng) : null,
        description: formData.description,
        image_url: formData.image_url,
        promo_images: formData.promo_images,
        rating: Number(formData.rating),
        tags: formData.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t !== ''),
        benefits: formData.benefits.split(',').map((b: string) => b.trim()).filter((b: string) => b !== ''),
        price: formData.price, 
        kakao_url: formData.kakao_url,
        telegram_url: formData.telegram_url,
        is_hot: formData.is_hot
      };
      const { error } = await supabase.from('stores').update(updateData).eq('id', id);
      if (error) throw error;
      alert('수정 완료!');
      navigate('/admin/manage-stores');
    } catch (err: any) {
      alert('수정 실패');
    } finally {
      setUpdating(false);
    }
  };

  if (!initialized || loading) return <div className="min-h-screen bg-black" />;

  const inputStyle = "w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-emerald-500 font-bold transition-all shadow-inner";

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans text-white">
      <div className="max-w-5xl mx-auto">
        <div className="bg-[#111] rounded-[3.5rem] p-8 md:p-16 border border-white/5 shadow-2xl">
          <header className="text-center mb-16">
            <h2 className="text-5xl font-black italic uppercase inline-block border-b-8 border-emerald-500 pb-4">업소 <span className="text-emerald-500">정보 수정</span></h2>
          </header>

          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-600/10 p-8 rounded-[2rem] border border-emerald-600/20 flex items-center justify-between">
                <p className="text-xl font-black text-emerald-500 italic uppercase">🔥 인기 업소(HOT)</p>
                <button type="button" onClick={() => setFormData({...formData, is_hot: !formData.is_hot})} className={`w-20 h-10 rounded-full relative transition-all duration-500 ${formData.is_hot ? 'bg-emerald-600' : 'bg-gray-800'}`}>
                  <div className={`absolute top-1 w-8 h-8 bg-white rounded-full transition-all ${formData.is_hot ? 'left-11' : 'left-1'}`} />
                </button>
              </div>
              <div className="bg-yellow-600/10 p-8 rounded-[2rem] border border-yellow-600/20 flex items-center justify-between">
                <p className="text-xl font-black text-yellow-500 italic uppercase">⭐ 별점 설정</p>
                <input type="number" step="0.1" value={formData.rating} onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})} className="w-24 bg-black text-yellow-500 text-center font-black text-2xl outline-none border-b-2 border-yellow-600 italic" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 italic">🏢 업소 명칭</label>
                <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={inputStyle} />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 italic">📍 지역 선택</label>
                <select value={formData.region} onChange={(e) => setFormData({...formData, region: e.target.value as any})} className={inputStyle}>
                  {Object.values(Region).map(reg => <option key={reg} value={reg}>{reg.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 italic">📂 카테고리</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value as any})} className={inputStyle}>
                  {Object.values(CategoryType).map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="md:col-span-2 space-y-4">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 italic">📍 상세 주소 및 위치 수정</label>
                <div className="flex gap-4">
                  <input required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className={inputStyle} />
                  <button type="button" onClick={handleFetchCoords} disabled={geoLoading} className="px-6 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 transition-all uppercase italic text-sm">좌표갱신</button>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <input value={formData.lat} onChange={(e) => setFormData({...formData, lat: e.target.value})} className={`${inputStyle} text-sm py-4`} placeholder="위도" />
                  <input value={formData.lng} onChange={(e) => setFormData({...formData, lng: e.target.value})} className={`${inputStyle} text-sm py-4`} placeholder="경도" />
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 italic">🖼️ 갤러리 이미지 관리</label>
                <input type="file" multiple accept="image/*" onChange={handleMultipleImageUpload} className={inputStyle} />
                <div className="grid grid-cols-5 gap-4 mt-4">
                  {formData.promo_images.map((url, idx) => (
                    <div key={idx} className={`relative aspect-square rounded-2xl overflow-hidden border-4 ${formData.image_url === url ? 'border-red-600' : 'border-transparent'}`}>
                      <img src={url} className="w-full h-full object-cover" alt="gallery" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-[#FAE100] uppercase tracking-widest ml-2 italic">💬 카카오톡 링크</label>
                <input value={formData.kakao_url} onChange={(e) => setFormData({...formData, kakao_url: e.target.value})} className={inputStyle} />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-[#0088CC] uppercase tracking-widest ml-2 italic">✈️ 텔레그램 링크</label>
                <input value={formData.telegram_url} onChange={(e) => setFormData({...formData, telegram_url: e.target.value})} className={inputStyle} />
              </div>
            </div>

            <div className="space-y-4">
               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 italic">📝 업소 상세 설명</label>
               <textarea rows={6} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className={`${inputStyle} h-48 resize-none py-6 leading-relaxed`} />
            </div>

            <div className="flex gap-6">
              <button type="button" onClick={() => navigate('/admin/manage-stores')} className="flex-1 py-7 bg-white/5 text-gray-500 font-black text-xl rounded-[2.5rem] uppercase italic">취소</button>
              <button type="submit" disabled={updating} className="flex-[2] py-7 bg-emerald-600 text-white font-black text-xl rounded-[2.5rem] shadow-2xl uppercase italic">수정 완료</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminStoreEdit;
