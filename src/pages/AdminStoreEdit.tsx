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
    image_url: '',
    rating: 4.5, // 🔴 추가: 수동 관리를 위한 별점 필드
    tags: '',
    benefits: '',
    kakao_url: '',
    telegram_url: '',
    is_hot: false
  });

  // 1. 기존 데이터 로드
  useEffect(() => {
    const fetchStore = async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!error && data) {
        setFormData({
          ...data,
          tags: data.tags?.join(', ') || '',
          benefits: data.benefits?.join(', ') || '',
          rating: data.rating || 4.5 // 🔴 DB에서 기존 별점 가져오기
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUpdating(true);
    const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
    const filePath = `store-images/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('stores')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('stores').getPublicUrl(filePath);
      setFormData({ ...formData, image_url: data.publicUrl });
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
          rating: Number(formData.rating), // 🔴 숫자로 변환하여 저장
          tags: formData.tags.split(',').map((t) => t.trim()),
          benefits: formData.benefits.split(',').map((b) => b.trim())
        })
        .eq('id', id);
      
      if (error) throw error;
      alert('업소 정보와 별점이 성공적으로 수정되었습니다!');
      navigate('/admin/manage-stores');
    } catch (err) {
      alert('수정 중 에러가 발생했습니다.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white italic animate-pulse tracking-widest uppercase">
      Loading Store Data...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans">
      <div className="max-w-5xl mx-auto bg-[#111] rounded-[3.5rem] p-10 md:p-16 border border-white/5 shadow-2xl">
        <header className="text-center mb-16">
          <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter inline-block border-b-8 border-emerald-500 pb-4">
            Edit <span className="text-emerald-500">Store</span>
          </h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-6">기존 업소 정보 수정 및 별점/HOT 상태 관리</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* HOT 업소 토글 */}
          <div className="bg-emerald-600/10 p-8 rounded-[2rem] border border-emerald-600/20 flex items-center justify-between">
            <div>
              <p className="text-xl font-black text-emerald-500 italic uppercase">🔥 Hot Store Setting</p>
              <p className="text-xs text-gray-500 font-bold uppercase mt-1">이 업소를 HOT 섹션에 노출 중입니다.</p>
            </div>
            <button 
              type="button"
              onClick={() => setFormData({...formData, is_hot: !formData.is_hot})}
              className={`w-20 h-10 rounded-full relative transition-all duration-300 ${formData.is_hot ? 'bg-emerald-600' : 'bg-gray-800'}`}
            >
              <div className={`absolute top-1 w-8 h-8 bg-white rounded-full transition-all ${formData.is_hot ? 'left-11' : 'left-1'}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-2">🏢 업소/숙소 명</label>
              <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-8 py-5 text-lg font-bold text-white focus:border-emerald-500 outline-none transition-all" />
            </div>

            {/* 🔴 추가: 별점(Star Rating) 수동 관리 */}
            <div className="space-y-4">
              <label className="text-sm font-black text-yellow-500 uppercase tracking-widest ml-2">⭐ 별점 관리 (0.5 ~ 5.0)</label>
              <input 
                type="number" 
                step="0.1" 
                min="0" 
                max="5"
                value={formData.rating} 
                onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})} 
                className="w-full bg-black border border-yellow-600/30 rounded-2xl px-8 py-5 text-lg font-black text-yellow-500 focus:border-yellow-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-2">📂 카테고리</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value as any})} className="w-full bg-black border border-white/10 rounded-2xl px-8 py-5 text-lg font-black text-white outline-none focus:border-emerald-500 italic">
                {Object.values(CategoryType).map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
              </select>
            </div>

            {/* 연락처 수정 */}
            <div className="space-y-4">
              <label className="text-sm font-black text-yellow-500 uppercase tracking-widest ml-2">💬 Kakaotalk Link</label>
              <input value={formData.kakao_url} onChange={(e) => setFormData({...formData, kakao_url: e.target.value})} className="w-full bg-black border border-yellow-600/30 rounded-2xl px-8 py-5 text-lg font-medium text-white focus:border-yellow-500 outline-none" placeholder="https://open.kakao.com/..." />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-black text-blue-500 uppercase tracking-widest ml-2">✈️ Telegram Link</label>
              <input value={formData.telegram_url} onChange={(e) => setFormData({...formData, telegram_url: e.target.value})} className="w-full bg-black border border-blue-600/30 rounded-2xl px-8 py-5 text-lg font-medium text-white focus:border-blue-500 outline-none" placeholder="https://t.me/..." />
            </div>
            
            <div className="space-y-4">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-2">📍 상세 주소</label>
              <input required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-8 py-5 text-lg font-bold text-white outline-none focus:border-emerald-500" />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-2">📝 업소 상세 설명</label>
            <textarea rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-black border border-white/10 rounded-3xl px-8 py-6 text-lg font-medium text-white outline-none focus:border-emerald-500 resize-none leading-relaxed" />
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={() => navigate('/admin/manage-stores')} className="flex-1 py-8 bg-white/5 text-gray-400 font-black text-2xl rounded-[2.5rem] hover:bg-white/10 transition-all uppercase italic">
              취소
            </button>
            <button type="submit" disabled={updating} className="flex-[2] py-8 bg-emerald-600 text-white font-black text-2xl rounded-[2.5rem] hover:bg-emerald-700 transition-all shadow-2xl uppercase italic tracking-tighter">
              {updating ? 'Updating...' : '수정 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminStoreEdit;
