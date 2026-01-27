import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { CategoryType, UserRole, User } from '../types';

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
    category: 'massage',
    region: 'HCMC',
    address: '',
    description: '',
    image_url: '',
    image_index: 0,
    rating: 4.5,
    tags: '',
    benefits: '', // 🔴 제휴 혜택 필드 추가
    is_hot: false,
    kakao_url: '',
    telegram_url: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 쉼표로 분리하여 배열화
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
        benefits: benefitArray, // 🔴 DB로 배열 전송
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
        <h2 className="text-4xl font-black text-white italic mb-10 uppercase tracking-tighter">
          <span className="text-red-600">Admin</span> Store Registration
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ... (이전과 동일한 필드들 생략) ... */}

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase ml-2">업소 태그 (쉼표로 구분)</label>
            <input placeholder="1군, 에이스, 가성비" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-red-600 outline-none" 
              value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
          </div>

          {/* 🔴 제휴 혜택 입력 칸 추가 */}
          <div className="space-y-2">
            <label className="text-xs font-black text-red-500/80 uppercase ml-2 italic">★ 호놀자 제휴 혜택 (쉼표로 구분)</label>
            <textarea 
              placeholder="호놀자 회원 10% 할인, 무료 음료 제공, 첫 방문 이벤트 등" 
              className="w-full bg-white/5 border border-red-600/20 rounded-2xl p-4 text-white focus:border-red-600 outline-none min-h-[100px]"
              value={formData.benefits} 
              onChange={e => setFormData({...formData, benefits: e.target.value})} 
            />
            <p className="text-[10px] text-gray-600 ml-2">* 입력하신 혜택들이 상세 페이지에 불렛 포인트로 나열됩니다.</p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 p-6 rounded-2xl border border-white/10">
            <input type="checkbox" id="is_hot" className="w-6 h-6 accent-red-600"
              checked={formData.is_hot} onChange={e => setFormData({...formData, is_hot: e.target.checked})} />
            <label htmlFor="is_hot" className="text-white font-black uppercase italic cursor-pointer text-sm">인기 업소(HOT)로 등록</label>
          </div>

          <button type="submit" className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-xl hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-95">
            등록하기 완료
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminStoreCreate;
