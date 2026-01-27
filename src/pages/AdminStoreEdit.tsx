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
    tags: '',
    benefits: '',
    kakao_url: '',
    telegram_url: '',
    is_hot: false
  });

  // 1. 기존 데이터 불러오기
  useEffect(() => {
    const fetchStore = async () => {
      const { data, error } = await supabase.from('stores').select('*').eq('id', id).single();
      if (!error && data) {
        setFormData({
          ...data,
          tags: data.tags.join(', '),
          benefits: data.benefits.join(', ')
        });
      }
      setLoading(false);
    };
    fetchStore();
  }, [id]);

  if (currentUser?.role !== 'ADMIN') { navigate('/'); return null; }
  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white italic animate-pulse">Loading Data...</div>;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUpdating(true);
    const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage.from('stores').upload(`store-images/${fileName}`, file);
    if (!uploadError) {
      const { data } = supabase.storage.from('stores').getPublicUrl(`store-images/${fileName}`);
      setFormData({ ...formData, image_url: data.publicUrl });
    }
    setUpdating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const { error } = await supabase.from('stores').update({
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()),
        benefits: formData.benefits.split(',').map(b => b.trim())
      }).eq('id', id);
      
      if (error) throw error;
      alert('수정되었습니다!');
      navigate('/admin/manage-stores');
    } catch (err) {
      alert('수정 실패');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans">
      <div className="max-w-5xl mx-auto bg-[#111] rounded-[3.5rem] p-10 md:p-16 border border-white/5 shadow-2xl">
        <header className="text-center mb-16">
          <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter inline-block border-b-8 border-emerald-500 pb-4">
            Edit <span className="text-emerald-500">Store</span>
          </h2>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* HOT 설정 토글 (등록 폼과 동일) */}
          <div className="bg-emerald-600/10 p-8 rounded-[2rem] border border-emerald-600/20 flex items-center justify-between">
            <div>
              <p className="text-xl font-black text-emerald-500 italic uppercase">🔥 Hot Store Setting</p>
            </div>
            <button type="button" onClick={() => setFormData({...formData, is_hot: !formData.is_hot})}
              className={`w-20 h-10 rounded-full relative transition-all ${formData.is_hot ? 'bg-emerald-600' : 'bg-gray-800'}`}>
              <div className={`absolute top-1 w-8 h-8 bg-white rounded-full transition-all ${formData.is_hot ? 'left-11' : 'left-1'}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-2">🏢 업소명</label>
              <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-8 py-5 text-lg font-bold text-white focus:border-emerald-500 outline-none" />
            </div>
            <div className="space-y-4">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-2">📂 카테고리</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value as any})} className="w-full bg-black border border-white/10 rounded-2xl px-8 py-5 text-lg font-black text-white outline-none">
                {Object.values(CategoryType).map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
              </select>
            </div>
            {/* 이미지, 연락처, 주소 등 나머지 필드 (AdminStoreCreate와 동일하게 큼직한 스타일로 구성) */}
            {/* ... (중략: AdminStoreCreate의 Input 필드들과 동일한 구조) ... */}
          </div>

          <button type="submit" disabled={updating} className="w-full py-8 bg-emerald-600 text-white font-black text-2xl rounded-[2.5rem] hover:bg-emerald-700 transition-all shadow-2xl uppercase italic">
            {updating ? '수정 사항 반영 중...' : '업소 정보 수정 완료'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminStoreEdit;
