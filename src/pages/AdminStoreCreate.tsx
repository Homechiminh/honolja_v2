import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
// 🔴 User는 타입이므로 'import type'을 사용하고, 
// 🔴 CategoryType은 코드 내에서 실제로 사용하도록 수정했습니다.
import { CategoryType, UserRole } from '../types';
import type { User } from '../types'; 

interface AdminStoreCreateProps {
  currentUser: User | null;
}

const AdminStoreCreate: React.FC<AdminStoreCreateProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  
  if (currentUser?.role !== UserRole.ADMIN) {
    alert('관리자만 접근 가능합니다.');
    navigate('/');
    return null;
  }

  const [formData, setFormData] = useState({
    name: '',
    category: 'massage', // 초기값
    region: 'HCMC',
    address: '',
    description: '',
    image_url: '',
    image_index: 0,
    rating: 4.5,
    tags: '',
    benefits: '',
    is_hot: false,
    kakao_url: '',
    telegram_url: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const tagArray = formData.tags.split(',').map(tag => tag.trim()).filter(t => t !== "");
    const benefitArray = formData.benefits.split(',').map(b => b.trim()).filter(b => b !== "");

    const { error } = await supabase.from('stores').insert([
      {
        name: formData.name,
        category: formData.category,
        region: formData.region,
        address: formData.address,
        description: formData.description,
        image_url: formData.image_url,
        image_index: formData.image_index,
        rating: formData.rating,
        is_hot: formData.is_hot,
        kakao_url: formData.kakao_url,
        telegram_url: formData.telegram_url,
        tags: tagArray,
        benefits: benefitArray,
        author_id: currentUser.id
      }
    ]);

    if (error) {
      alert('등록 실패: ' + error.message);
    } else {
      alert('성공적으로 등록되었습니다!');
      navigate(`/stores/${formData.category}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-40 pb-20 px-6">
      <div className="max-w-3xl mx-auto bg-[#111] rounded-[3rem] p-12 border border-white/5 shadow-2xl">
        <h2 className="text-4xl font-black text-white italic mb-10 uppercase tracking-tighter text-center">
          <span className="text-red-600 underline decoration-red-600/30 underline-offset-8">Admin</span> Registration
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase ml-2 tracking-widest">업소/숙소 명</label>
              <input required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-red-600 outline-none transition-all" 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase ml-2 tracking-widest">카테고리</label>
              {/* 🔴 CategoryType을 실제로 여기서 사용하여 TS6133 에러를 해결합니다. */}
              <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-red-600 outline-none appearance-none"
                value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                {Object.values(CategoryType).map(cat => (
                  <option key={cat} value={cat} className="bg-[#111] text-white font-bold uppercase">{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase ml-2 tracking-widest">대표 이미지 URL</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-red-600 outline-none"
                value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase ml-2 tracking-widest">이미지 인덱스 (0~11)</label>
              <input type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-red-600 outline-none"
                value={formData.image_index} onChange={e => setFormData({...formData, image_index: parseInt(e.target.value)})} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase ml-2 tracking-widest">상세 주소</label>
            <input required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-red-600 outline-none"
              value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase ml-2 tracking-widest">상세 설명</label>
            <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-red-600 outline-none"
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
               <label className="text-xs font-black text-gray-500 uppercase ml-2 tracking-widest">태그 (쉼표로 구분)</label>
               <input placeholder="1군, 에이스, 출장가능" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-red-600 outline-none"
                 value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
             </div>
             <div className="space-y-2">
               <label className="text-xs font-black text-red-500/80 uppercase ml-2 tracking-widest italic">★ 제휴 혜택 (쉼표 구분)</label>
               <input placeholder="10%할인, 1+1 이벤트" className="w-full bg-white/5 border border-red-600/20 rounded-2xl p-4 text-white focus:border-red-600 outline-none"
                 value={formData.benefits} onChange={e => setFormData({...formData, benefits: e.target.value})} />
             </div>
          </div>

          <div className="flex items-center gap-4 bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-red-600/30 transition-all cursor-pointer group">
            <input type="checkbox" id="is_hot" className="w-6 h-6 accent-red-600 cursor-pointer"
              checked={formData.is_hot} onChange={e => setFormData({...formData, is_hot: e.target.checked})} />
            <label htmlFor="is_hot" className="text-white font-black uppercase italic cursor-pointer text-sm group-hover:text-red-500 transition-colors">인기 업소(HOT)로 선정하기</label>
          </div>

          <button type="submit" className="w-full py-6 bg-red-600 text-white rounded-[2rem] font-black text-xl hover:bg-red-700 transition-all shadow-2xl shadow-red-900/20 active:scale-[0.98]">
            등록 프로세스 완료
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminStoreCreate;
