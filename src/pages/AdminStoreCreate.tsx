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
    tags: '',
    benefits: '',
    kakao_url: '',
    telegram_url: '',
    is_hot: false
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `store-images/${fileName}`;
    try {
      const { error: uploadError } = await supabase.storage.from('stores').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('stores').getPublicUrl(filePath);
      setFormData({ ...formData, image_url: data.publicUrl });
    } catch (err) {
      alert('이미지 업로드 실패: Storage 버킷 설정을 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) return alert('이미지를 업로드해주세요.');
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
      alert('등록 완료!');
      navigate('/admin/manage-stores');
    } catch (err) {
      alert('등록 실패');
    } finally {
      setLoading(false);
    }
  };

  // 🔴 항상 보이는 뚜렷한 입력창 스타일
  const inputStyle = "w-full bg-[#1c1c1c] border-2 border-[#333] rounded-2xl px-6 py-5 text-lg font-bold text-white placeholder:text-gray-600 focus:border-red-600 focus:bg-black outline-none transition-all shadow-md";
  const labelStyle = "text-sm font-black text-gray-400 uppercase tracking-widest ml-2 mb-2 block";

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans">
      <div className="max-w-5xl mx-auto bg-[#111] rounded-[3.5rem] p-8 md:p-16 border border-white/5 shadow-2xl">
        
        <header className="text-center mb-16">
          <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter inline-block border-b-8 border-red-600 pb-4">
            Admin <span className="text-red-600">Registration</span>
          </h2>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* HOT 토글 박스 */}
          <div className="bg-[#1c1c1c] p-8 rounded-[2.5rem] border-2 border-[#333] flex items-center justify-between">
            <div>
              <p className="text-xl font-black text-red-500 italic uppercase">🔥 Hot Store Activation</p>
              <p className="text-xs text-gray-500 font-bold mt-1">메인 HOT 섹션 노출 여부</p>
            </div>
            <button type="button" onClick={() => setFormData({...formData, is_hot: !formData.is_hot})}
              className={`w-20 h-10 rounded-full relative transition-all duration-300 ${formData.is_hot ? 'bg-red-600' : 'bg-gray-700'}`}>
              <div className={`absolute top-1 w-8 h-8 bg-white rounded-full transition-all ${formData.is_hot ? 'left-11' : 'left-1'}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className={labelStyle}>🏢 업소/숙소 명</label>
              <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={inputStyle} placeholder="상호를 입력하세요" />
            </div>

            <div>
              <label className={labelStyle}>📍 지역 선택</label>
              <select value={formData.region} onChange={(e) => setFormData({...formData, region: e.target.value as any})} className={inputStyle}>
                <option value={Region.HCMC}>호치민 (HCMC)</option>
                <option value={Region.DANANG}>다낭 (DANANG)</option>
                <option value={Region.NHA_TRANG}>나트랑 (NHA TRANG)</option>
              </select>
            </div>

            <div>
              <label className={labelStyle}>📂 카테고리</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value as any})} className={inputStyle}>
                {Object.values(CategoryType).map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
              </select>
            </div>

            <div>
              <label className={labelStyle}>🖼️ 이미지 파일 첨부</label>
              <div className="relative overflow-hidden">
                <input type="file" accept="image/*" onChange={handleImageUpload} className={inputStyle} />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase">Select File</span>
                </div>
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
            <label className={labelStyle}>📍 구글맵 연동 주소</label>
            <input required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className={inputStyle} placeholder="정확한 주소를 입력하세요" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="text-sm font-black text-emerald-500 uppercase tracking-widest ml-2 mb-2 block">🏷️ 태그 (쉼표 구분)</label>
              <input value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} className={inputStyle} placeholder="에이스, 가성비, 1군" />
            </div>
            <div>
              <label className="text-sm font-black text-red-500 uppercase tracking-widest ml-2 mb-2 block">🎁 제휴 혜택 (쉼표 구분)</label>
              <input value={formData.benefits} onChange={(e) => setFormData({...formData, benefits: e.target.value})} className={inputStyle} placeholder="10% 할인, 무료 음료" />
            </div>
          </div>

          <div>
            <label className={labelStyle}>📝 상세 설명</label>
            <textarea rows={5} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className={`${inputStyle} h-40 resize-none`} placeholder="업소 상세 정보를 입력하세요." />
          </div>

          <button type="submit" disabled={loading} className="w-full py-8 bg-red-600 text-white font-black text-2xl rounded-[2.5rem] hover:bg-red-700 transition-all shadow-xl uppercase italic">
            {loading ? '등록 중...' : '새 업소 등록 완료'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminStoreCreate;
