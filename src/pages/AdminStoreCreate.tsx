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
    image_url: '', // 파일 업로드 후 반환된 URL이 저장될 곳
    image_index: 0,
    tags: '',
    benefits: '',
    // 🔴 담당자 연락처 링크 추가
    kakao_url: '',
    telegram_url: ''
  });

  // 🔴 이미지 파일 업로드 핸들러 (파일첨부 기능)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `store-images/${fileName}`;

    try {
      // Supabase Storage 'stores' 버킷에 업로드 (버킷이 미리 생성되어 있어야 함)
      const { error: uploadError } = await supabase.storage
        .from('stores')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 업로드된 이미지의 공개 URL 가져오기
      const { data } = supabase.storage.from('stores').getPublicUrl(filePath);
      setFormData({ ...formData, image_url: data.publicUrl });
      alert('이미지 업로드 성공!');
    } catch (error) {
      console.error('이미지 업로드 에러:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) return alert('이미지를 업로드해주세요.');
    setLoading(true);

    try {
      const { error } = await supabase.from('stores').insert([
        {
          ...formData,
          tags: formData.tags.split(',').map((t) => t.trim()),
          benefits: formData.benefits.split(',').map((b) => b.trim()),
          author_id: currentUser?.id,
        },
      ]);

      if (error) throw error;
      alert('업소가 성공적으로 등록되었습니다!');
      navigate('/admin');
    } catch (err) {
      console.error(err);
      alert('등록 중 에러가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto bg-[#111] rounded-[3rem] p-12 border border-white/5 shadow-2xl">
        <header className="text-center mb-12">
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter inline-block border-b-4 border-red-600 pb-2">
            Admin <span className="text-red-600">Registration</span>
          </h2>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 업소 기본 정보 */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">업소/숙소 명</label>
              <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-red-600 outline-none transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">카테고리</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value as any})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white outline-none">
                {Object.values(CategoryType).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {/* 🔴 파일 첨부 영역 (URL 입력 대신 파일 선택) */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">대표 이미지 파일 첨부</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer" />
              {formData.image_url && <p className="text-[9px] text-emerald-500 ml-4">✓ 이미지 업로드 완료</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">이미지 인덱스 (0~11)</label>
              <input type="number" value={formData.image_index} onChange={(e) => setFormData({...formData, image_index: parseInt(e.target.value)})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white outline-none" />
            </div>

            {/* 🔴 연락처 링크 섹션 (새로 추가) */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest ml-4 italic">KakaoTalk Link</label>
              <input value={formData.kakao_url} onChange={(e) => setFormData({...formData, kakao_url: e.target.value})} className="w-full bg-black border border-yellow-600/20 rounded-2xl px-6 py-4 text-white focus:border-yellow-500 outline-none" placeholder="https://open.kakao.com/..." />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-4 italic">Telegram Link</label>
              <input value={formData.telegram_url} onChange={(e) => setFormData({...formData, telegram_url: e.target.value})} className="w-full bg-black border border-blue-600/20 rounded-2xl px-6 py-4 text-white focus:border-blue-500 outline-none" placeholder="https://t.me/..." />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">상세 주소</label>
            <input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white outline-none" placeholder="호치민 1군... 등" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">상세 설명</label>
            <textarea rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white outline-none resize-none" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-6 bg-red-600 text-white font-black text-xl rounded-[2rem] hover:bg-red-700 transition-all shadow-2xl uppercase italic">
            {loading ? '처리 중...' : '새 업소 등록하기'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminStoreCreate;
