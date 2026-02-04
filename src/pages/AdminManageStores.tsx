import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // 🔴 Link 제거 (에러 해결)
import { supabase } from '../supabase';
import { CategoryType, UserRole } from '../types'; 
import type { Store } from '../types';
import { useAuth } from '../contexts/AuthContext'; 
import { useFetchGuard } from '../hooks/useFetchGuard'; 

const AdminManageStores: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, initialized } = useAuth();

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  /**
   * 🔴 업소 데이터베이스 동기화
   */
  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('stores').select('*').order('created_at', { ascending: false });
      
      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (data) setStores(data as Store[]);
    } catch (err: any) {
      console.error('Store Archive Sync Failed:', err.message);
    } finally {
      setLoading(false);
    }
  }, [filterCategory]);

  useFetchGuard(fetchStores, [filterCategory]);

  /**
   * 🔴 업소 삭제 핸들러
   */
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`[${name}] 업소를 정말로 삭제하시겠습니까? 관련 데이터가 모두 소멸됩니다.`)) return;
    try {
      const { error } = await supabase.from('stores').delete().eq('id', id);
      if (error) throw error;
      alert('업소가 성공적으로 삭제되었습니다.');
      setStores(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      alert('삭제 처리 중 오류가 발생했습니다.');
    }
  };

  /**
   * 🔴 인기 업소(HOT) 토글 핸들러
   */
  const toggleHot = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('stores').update({ is_hot: !currentStatus }).eq('id', id);
      if (error) throw error;
      setStores(prev => prev.map(s => s.id === id ? { ...s, is_hot: !currentStatus } : s));
    } catch (err: any) {
      alert('상태 변경 실패');
    }
  };

  // 세션 확인 및 권한 가드 (튕김 방지)
  if (!initialized || (loading && stores.length === 0)) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-orange-500 font-black italic animate-pulse tracking-widest uppercase text-xl">
          업소 데이터베이스 로딩 중...
        </div>
      </div>
    );
  }

  // 관리자 권한 확인
  if (!currentUser || currentUser.role !== UserRole.ADMIN) return null;

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans text-white selection:bg-orange-600/30">
      <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
        
        {/* 🔴 상단 네비게이션 섹션 (한글 버튼들) */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/admin')}
              className="text-gray-500 hover:text-white transition-all font-black uppercase italic text-xs tracking-widest border-b border-transparent hover:border-white pb-1"
            >
              관리자 대시보드
            </button>
            <button 
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-white transition-all font-black uppercase italic text-xs tracking-widest border-b border-transparent hover:border-white pb-1"
            >
              홈으로 이동
            </button>
          </div>

          <button 
            onClick={() => navigate('/admin/create-store')}
            className="w-full md:w-auto px-8 py-3.5 bg-white text-black font-black text-[11px] rounded-2xl uppercase italic hover:bg-orange-600 hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span> 신규 업소 추가
          </button>
        </div>

        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
              업소 <span className="text-orange-600">현황 관리</span>
            </h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-4 ml-1 italic">
              등록된 모든 제휴 업소의 정보 수정 및 상태 제어 센터
            </p>
          </div>

          {/* 카테고리 필터 */}
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#111] border border-white/10 rounded-xl px-6 py-3 text-xs font-black uppercase italic outline-none focus:border-orange-600 transition-all cursor-pointer"
          >
            <option value="all">전체 카테고리</option>
            {Object.values(CategoryType).map(cat => (
              <option key={cat} value={cat}>{cat.toUpperCase()}</option>
            ))}
          </select>
        </header>

        <div className="bg-[#111] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-white/5 border-b border-white/5 text-[10px] font-black uppercase text-gray-500 italic tracking-widest">
                  <th className="p-6">업소 정보</th>
                  <th className="p-6">카테고리 / 지역</th>
                  <th className="p-6 text-center">인기 설정</th>
                  <th className="p-6 text-right">관리 작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stores.map((store) => (
                  <tr key={store.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 shadow-lg shrink-0">
                          <img src={store.image_url} alt={store.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-black text-white text-lg italic uppercase tracking-tighter">{store.name}</p>
                          <p className="text-gray-600 text-[10px] font-bold italic tracking-tight line-clamp-1">{store.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-orange-500 font-black text-[10px] uppercase italic">#{store.category}</span>
                        <span className="text-gray-400 font-bold text-[10px] uppercase">{store.region}</span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <button 
                        onClick={() => toggleHot(store.id, store.is_hot)}
                        className={`w-14 h-7 rounded-full relative transition-all duration-500 mx-auto ${store.is_hot ? 'bg-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.4)]' : 'bg-gray-800'}`}
                      >
                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${store.is_hot ? 'left-8 shadow-lg' : 'left-1'}`} />
                      </button>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => navigate(`/admin/edit-store/${store.id}`)}
                          className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase italic hover:bg-white hover:text-black transition-all"
                        >
                          수정
                        </button>
                        <button 
                          onClick={() => handleDelete(store.id, store.name)}
                          className="px-5 py-2 bg-red-600/10 border border-red-600/20 text-red-500 rounded-xl text-[10px] font-black uppercase italic hover:bg-red-600 hover:text-white transition-all shadow-lg"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {stores.length === 0 && !loading && (
            <div className="py-32 text-center">
              <p className="text-gray-700 font-black italic uppercase tracking-widest">검색된 업소 정보가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManageStores;
