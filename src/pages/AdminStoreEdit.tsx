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
    rating: 4.5,
    tags: '',
    benefits: '', // 🔴 제휴 혜택
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
          rating: data.rating || 4.5
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
      const { error: uploadError } = await supabase.storage.from('stores').upload(filePath, file);
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
          {/* HOT 설정 (image_407d60.png 디자인 적용) */}
          <div className="bg-emerald-600/10 p-8 rounded-[2rem] border border-emerald-600/20 flex items-center justify-between">
            <div>
              <p className="text-xl font-black text-emerald-500 italic uppercase">🔥 Hot Store Setting</p>
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
            <div className="space-y-4">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-2">🏢 업소/숙소 명</label>
              <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-8 py-5 text-white outline-none focus:border-emerald-500" />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-black text-yellow-500 uppercase tracking-widest ml-2">⭐ 별점 관리 (0.5 ~ 5.0)</label>
              <input type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})} className="w-full bg-black border border-yellow-600/30 rounded-2xl px-8 py-5 text-yellow-500 font-black outline-none" />
            </div>

            {/* 대표 이미지 변경 섹션 (image_407d60.png 구조) */}
            <div className="md:col-span-2 space-y-4">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-2">🖼️ 대표 이미지 변경</label>
              <div className="flex items-center gap-6 p-2 bg-black/40 rounded-3xl border border-white/5">
                {formData.image_url && (
                  <img src={formData.image_url} alt="Current" className="w-24 h-24 rounded-2xl object-cover border border-white/10" />
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="flex-1 bg-transparent text-sm text-gray-500 file:mr-6 file:py-3 file:px-8 file:rounded-xl file:bg-emerald-600 file:text-white cursor-pointer" />
              </div>
            </div>

            {/* SNS 링크 섹션 */}
            <div className="space-y-4">
              <label className="text-sm font-black text-yellow-500 uppercase tracking-widest ml-2">💬 Kakaotalk Link</label>
              <input value={formData.kakao_url} onChange={(e) => setFormData({...formData, kakao_url: e.target.value})} className="w-full bg-black border border-yellow-600/30 rounded-2xl px-8 py-5 text-white outline-none focus:border-yellow-500" />
            </div>
            <div className="space-y-4">
              <label className="text-sm font-black text-blue-500 uppercase tracking-widest ml-2">✈️ Telegram Link</label>
              <input value={formData.telegram_url} onChange={(e) => setFormData({...formData, telegram_url: e.target.value})} className="w-full bg-black border border-blue-600/30 rounded-2xl px-8 py-5 text-white outline-none focus:border-blue-500" />
            </div>
          </div>

          {/* 🔴 추가: 제휴 혜택 및 상세 설명 섹션 (누락되었던 부분 보강) */}
          <div className="space-y-8 pt-8 border-t border-white/5">
            <div className="space-y-4">
              <label className="text-sm font-black text-red-500 uppercase tracking-widest ml-2">🎁 제휴 혜택 (쉼표로 구분하여 여러 개 입력)</label>
              <input 
                placeholder="예: 호놀자 회원 10% 할인, 웰컴 드링크 제공"
                value={formData.benefits} 
                onChange={(e) => setFormData({...formData, benefits: e.target.value})} 
                className="w-full bg-black border border-red-600/30 rounded-2xl px-8 py-5 text-lg font-bold text-white focus:border-red-600 outline-none transition-all" 
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-2">📝 업소 상세 설명</label>
              <textarea 
                rows={8} 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                className="w-full bg-black border border-white/10 rounded-[2.5rem] px-8 py-8 text-lg font-medium text-white outline-none focus:border-emerald-500 resize-none leading-relaxed" 
                placeholder="업소에 대한 상세 정보를 입력해주세요."
              />
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="flex gap-4 pt-10">
            <button type="button" onClick={() => navigate('/admin/manage-stores')} className="flex-1 py-8 bg-white/5 text-gray-400 font-black text-2xl rounded-[2.5rem] uppercase italic border border-white/5 hover:bg-white/10">
              취소
            </button>
            <button type="submit" disabled={updating} className="flex-[2] py-8 bg-emerald-600 text-white font-black text-2xl rounded-[2.5rem] shadow-2xl uppercase italic tracking-tighter hover:bg-emerald-700 active:scale-95 transition-all">
              {updating ? 'Updating...' : '수정 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminStoreEdit;
