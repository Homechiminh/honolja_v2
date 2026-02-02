import React, { useState, useEffect } from 'react'; // 🔴 useEffect 추가
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { CategoryType, Region, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext'; 

const AdminStoreCreate: React.FC = () => {
  const navigate = useNavigate();
  
  // 1. 전역 인증 정보 및 초기화 상태 구독 (initialized 사용)
  const { currentUser, initialized } = useAuth(); 
  
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: CategoryType.MASSAGE,
    region: Region.HCMC,
    address: '',
    description: '',
    image_url: '',
    promo_images: [] as string[],
    rating: 4.5,
    image_index: 0,
    tags: '',
    benefits: '',
    kakao_url: '',
    telegram_url: '',
    is_hot: false
  });

  // 🔴 튕김 방지 가드: 세션 초기화 완료 전에는 판단 보류
  useEffect(() => {
    if (initialized) {
      if (!currentUser || currentUser.role !== UserRole.ADMIN) {
        navigate('/', { replace: true });
      }
    }
  }, [initialized, currentUser, navigate]);

  /**
   * 🔴 이미지 다중 업로드 로직
   */
  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setLoading(true);
    const newUrls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const filePath = `store-images/${fileName}`;
        
        const { error: uploadError } = await supabase.storage.from('stores').upload(filePath, file);
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage.from('stores').getPublicUrl(filePath);
        newUrls.push(data.publicUrl);
      }
      
      setFormData(prev => ({
        ...prev,
        promo_images: [...prev.promo_images, ...newUrls],
        image_url: prev.image_url || newUrls[0] 
      }));
    } catch (err: any) {
      alert(`이미지 업로드 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔴 새 업소 등록 제출 로직
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return alert('관리자 세션이 만료되었습니다. 다시 로그인해주세요.');
    if (!formData.image_url) return alert('최소 한 장 이상의 이미지를 업로드하세요.');
    
    setLoading(true);
    try {
      const payload = {
        ...formData,
        rating: Number(formData.rating),
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
        benefits: formData.benefits.split(',').map(b => b.trim()).filter(b => b !== ''),
        author_id: currentUser.id
      };

      const { error: insertError } = await supabase.from('stores').insert([payload]);
      
      if (insertError) throw insertError;

      alert('새 업소 등록 완료!');
      navigate('/admin/manage-stores');
    } catch (err: any) {
      alert(`등록 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🔴 초기화 로딩 화면 (한글화)
  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-red-600 font-black animate-pulse tracking-widest uppercase italic text-xl">
          관리자 권한 확인 중...
        </div>
      </div>
    );
  }

  // 관리자가 아닐 경우 렌더링 방지
  if (!currentUser || currentUser.role !== UserRole.ADMIN) return null;

  const inputStyle = "w-full bg-[#1c1c1c] border-2 border-[#333] rounded-2xl px-6 py-5 text-lg font-bold text-white focus:border-red-600 focus:bg-black outline-none transition-all shadow-md placeholder:text-gray-700";
  const labelStyle = "text-sm font-black text-gray-400 uppercase tracking-widest ml-2 mb-2 block";

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans selection:bg-red-600/30">
      <div className="max-w-5xl mx-auto bg-[#111] rounded-[3.5rem] p-8 md:p-16 border border-white/5 shadow-2xl animate-in fade-in duration-700">
        <header className="text-center mb-16">
          <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter inline-block border-b-8 border-red-600 pb-4 leading-none">
            신규 <span className="text-red-600">업소 등록</span>
          </h2>
        </header>
        
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* 상단 핫플레이스/별점 설정 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#1c1c1c] p-8 rounded-[2.5rem] border-2 border-[#333] flex items-center justify-between shadow-inner">
              <p className="text-xl font-black text-red-500 italic uppercase tracking-tight">🔥 인기 업소(HOT)</p>
              <button type="button" onClick={() => setFormData({...formData, is_hot: !formData.is_hot})}
                className={`w-20 h-10 rounded-full relative transition-all duration-500 ${formData.is_hot ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-gray-800'}`}>
                <div className={`absolute top-1 w-8 h-8 bg-white rounded-full transition-all duration-300 ${formData.is_hot ? 'left-11 shadow-lg' : 'left-1'}`} />
              </button>
            </div>
            <div className="bg-[#1c1c1c] p-8 rounded-[2.5rem] border-2 border-[#333] flex items-center justify-between shadow-inner">
              <p className="text-xl font-black text-yellow-500 italic uppercase tracking-tight">⭐ 별점 설정</p>
              <input type="number" step="0.1" value={formData.rating}
                onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
                className="w-24 bg-black text-yellow-500 text-center font-black text-2xl outline-none border-b-2 border-yellow-600 italic" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 기본 정보 */}
            <div className="space-y-2">
              <label className={labelStyle}>🏢 업소/숙소 명</label>
              <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={inputStyle} placeholder="상호를 입력하세요" />
            </div>
            <div className="space-y-2">
              <label className={labelStyle}>📂 카테고리</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value as any})} className={`${inputStyle} italic`}>
                {Object.values(CategoryType).map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
              </select>
            </div>

            {/* 이미지 업로드 */}
            <div className="md:col-span-2 space-y-4">
              <label className={labelStyle}>🖼️ 갤러리 사진 등록 (첫 장이 대표사진)</label>
              <input type="file" multiple accept="image/*" onChange={handleMultipleImageUpload} className={`${inputStyle} text-sm file:mr-6 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer`} />
              
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-6">
                {formData.promo_images.map((url, idx) => (
                  <div key={idx} onClick={() => setFormData({...formData, image_url: url})}
                    className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-4 transition-all duration-300 ${formData.image_url === url ? 'border-red-600 scale-105 shadow-xl' : 'border-transparent opacity-40 hover:opacity-100'}`}
                  >
                    <img src={url} className="w-full h-full object-cover" alt="preview" />
                    {formData.image_url === url && (
                      <div className="absolute inset-0 bg-red-600/10 flex items-center justify-center">
                        <span className="bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded uppercase italic shadow-lg">대표</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 나머지 입력 필드들 */}
            <div className="md:col-span-2 space-y-2">
              <label className={labelStyle}>📍 상세 주소</label>
              <input required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className={inputStyle} placeholder="주소를 입력하세요" />
            </div>
            
            <div className="space-y-2">
              <label className={labelStyle}>💬 카톡 링크</label>
              <input value={formData.kakao_url} onChange={(e) => setFormData({...formData, kakao_url: e.target.value})} className={inputStyle} placeholder="카카오톡 오픈채팅 URL" />
            </div>
            <div className="space-y-2">
              <label className={labelStyle}>✈️ 텔레그램 링크</label>
              <input value={formData.telegram_url} onChange={(e) => setFormData({...formData, telegram_url: e.target.value})} className={inputStyle} placeholder="텔레그램 아이디/링크" />
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelStyle}>📝 업소 설명</label>
            <textarea rows={6} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className={`${inputStyle} h-48 resize-none py-6`} placeholder="업소의 상세 설명을 입력하세요" />
          </div>

          <button type="submit" disabled={loading || !formData.image_url} className="w-full py-8 bg-red-600 text-white font-black text-2xl rounded-[2.5rem] hover:bg-red-700 transition-all uppercase italic shadow-2xl shadow-red-900/40 active:scale-[0.98] disabled:opacity-20">
            {loading ? '데이터 전송 중...' : '새 업소 등록 완료'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminStoreCreate;
