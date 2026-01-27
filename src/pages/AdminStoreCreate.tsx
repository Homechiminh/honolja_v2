// src/pages/AdminStoreCreate.tsx 전문
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { CategoryType, Region, UserRole, User } from '../types';

interface AdminStoreCreateProps {
  currentUser: User | null;
}

const AdminStoreCreate: React.FC<AdminStoreCreateProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  
  // 1. 보안 가드: Admin이 아니면 홈으로 튕겨냅니다.
  if (currentUser?.role !== UserRole.ADMIN) {
    alert('관리자만 접근 가능합니다.');
    navigate('/');
    return null;
  }

  // 2. 입력 폼 상태 관리
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
    is_hot: false,
    kakao_url: '',
    telegram_url: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 쉼표로 구분된 태그를 배열로 변환
    const tagArray = formData.tags.split(',').map(tag => tag.trim());

    // 3. Supabase에 실제 데이터 저장
    const { data, error } = await supabase.from('stores').insert([
      {
        ...formData,
        tags: tagArray,
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
          <span className="text-red-600">Admin</span> Store / Stay Registration
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase ml-2">업소/숙소 명</label>
              <input required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-red-600 outline-none" 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase ml-2">카테고리</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-red-600 outline-none"
                value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                {Object.values(CategoryType).map(cat => <option key={cat} value={cat} className="bg-[#111]">{cat.toUpperCase()}</option>)}
              </select>
            </div>
          </div>

          {/* 이미지 관련 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase ml-2">이미지 URL (스프라이트 혹은 고화질)</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-red-600 outline-none"
                value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase ml-2">이미지 인덱스 (스프라이트용)</label>
              <input type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-red-600 outline-none"
                value={formData.image_index} onChange={e => setFormData({...formData, image_index: parseInt(e.target.value)})} />
            </div>
          </div>

          {/* 상세 설명 */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase ml-2">상세 설명</label>
            <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-red-600 outline-none"
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          {/* 담당자 연락처 링크 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase ml-2">카톡 오픈챗 링크 (공백시 기본연결)</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-red-600 outline-none"
                value={formData.kakao_url} onChange={e => setFormData({...formData, kakao_url: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase ml-2">텔레그램 링크 (공백시 기본연결)</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-red-600 outline-none"
                value={formData.telegram_url} onChange={e => setFormData({...formData, telegram_url: e.target.value})} />
            </div>
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
