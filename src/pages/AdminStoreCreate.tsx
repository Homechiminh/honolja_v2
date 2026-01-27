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
    image_url: '', // HOT 업소든 일반 업소든 이 URL 하나로 통일
    tags: '',
    benefits: '',
    kakao_url: '',
    telegram_url: '',
    is_hot: false
  });

  // 이미지 업로드 핸들러
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) return alert('대표 이미지를 등록해주세요.');
    setLoading(true);

    try {
      const { error } = await supabase.from('stores').insert([{
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()),
        benefits: formData.benefits.split(',').map(b => b.trim()),
        author_id: currentUser?.id,
        rating: 4.5,
        review_count: 0
      }]);
      if (error) throw error;
      alert('업소가 성공적으로 등록되었습니다!');
      navigate('/admin');
    } catch (err) {
      alert('등록 중 에러 발생');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans">
      <div className="max-w-5xl mx-auto bg-[#111] rounded-[3.5rem] p-10 md:p-16 border border-white/5 shadow-2xl">
        <header className="text-center mb-16">
          <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter inline-block border-b-8 border-red-600 pb-4">
            Admin <span className="text-red-600">Registration</span>
          </h2>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* HOT 업소 토글 (디자인 강조) */}
          <div className="bg-red-600/10 p-8 rounded-[2rem] border border-red-600/20 flex items-center justify-between">
            <div>
              <p className="text-xl font-black text-red-500 italic uppercase">🔥 Hot Store Setting</p>
              <p className="text-xs text-gray-500 font-bold uppercase mt-1">이 업소를 메인 화면 HOT 섹션에 노출할까요?</p>
            </div>
            <button 
              type="button"
              onClick={() => setFormData({...formData, is_hot: !formData.is_hot})}
              className={`w-20 h-10 rounded-full relative transition-all duration-300 ${formData.is_hot ? 'bg-red-600' : 'bg-gray-800'}`}
            >
              <div className={`absolute top-1 w-8 h-8 bg-white rounded-full transition-all ${formData.is_hot ? 'left-11' : 'left-1'}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* 업소명 / 카테고리 */}
            <div className="space-y-4">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-2">🏢 업소/숙소 명</label>
              <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-8 py-5 text-lg font-bold text-white focus:border-red-600 outline-none transition-all shadow-inner" placeholder="정확한 상호를 입력하세요" />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-2">📂 카테고리</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value as any})} className="w-full bg-black border border-white/10 rounded-2xl px-8 py-5 text-lg font-black text-white outline-none focus:border-red-600 italic">
                {Object.values(CategoryType).map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
              </select>
            </div>

            {/* 이미지 업로드 (Index 삭제됨) */}
            <div className="md:col-span-2 space-y-4">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-2">🖼️ 대표 이미지 파일 (HOT용 별도 URL도 파일첨부로 처리)</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full bg-black border border-white/10 rounded-2xl px-8 py-5 text-sm text-gray-500 file:mr-6 file:py-3 file:px-8 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-red-600 file:text-white cursor-pointer" />
              {formData.image_url && <p className="text-xs text-emerald-500 mt-2 font-bold ml-2">✓ 이미지 등록 완료</p>}
            </div>

            {/* 담당자 연락처 */}
            <div className="space-y-4">
              <label className="text-sm font-black text-yellow-500 uppercase tracking-widest ml-2">💬 Kakaotalk Link</label>
              <input value={formData.kakao_url} onChange={(e) => setFormData({...formData, kakao_url: e.target.value})} className="w-full bg-black border border-yellow-600/30 rounded-2xl px-8 py-5 text-lg font-medium text-white focus:border-yellow-500 outline-none" placeholder="https://open.kakao.com/..." />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-black text-blue-500 uppercase tracking-widest ml-2">✈️ Telegram Link</label>
              <input value={formData.telegram_url} onChange={(e) => setFormData({...formData, telegram_url: e.target.value})} className="w-full bg-black border border-blue-600/30 rounded-2xl px-8 py-5 text-lg font-medium text-white focus:border-blue-500 outline-none" placeholder="https://t.me/..." />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-2">📍 상세 주소</label>
            <input required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-8 py-5 text-lg font-bold text-white outline-none focus:border-red-600" placeholder="구글 지도 주소를 붙여넣으세요" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-sm font-black text-emerald-500 uppercase tracking-widest ml-2">🏷️ 태그 (쉼표 구분)</label>
              <input value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} className="w-full bg-black border border-emerald-600/30 rounded-2xl px-8 py-5 text-lg text-white outline-none" placeholder="예: 1군, 가성비, 에이스" />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-black text-red-500 uppercase tracking-widest ml-2">🎁 제휴 혜택 (쉼표 구분)</label>
              <input value={formData.benefits} onChange={(e) => setFormData({...formData, benefits: e.target.value})} className="w-full bg-black border border-red-600/30 rounded-2xl px-8 py-5 text-lg text-white outline-none" placeholder="예: 10%할인, 2+1이벤트" />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-2">📝 상세 설명</label>
            <textarea rows={6} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-black border border-white/10 rounded-3xl px-8 py-6 text-lg font-medium text-white outline-none focus:border-red-600 resize-none leading-relaxed" placeholder="업소의 상세 정보를 입력하세요" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-8 bg-red-600 text-white font-black text-2xl rounded-[2.5rem] hover:bg-red-700 transition-all shadow-2xl uppercase italic tracking-tighter">
            {loading ? '데이터 처리 중...' : '새 업소 등록 시스템 가동'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminStoreCreate;
