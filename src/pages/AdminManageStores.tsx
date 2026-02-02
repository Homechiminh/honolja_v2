import React, { useState, useEffect } from 'react'; // 🔴 useEffect 추가됨
import { useNavigate } from 'react-router-dom'; 
import { supabase } from '../supabase';
import { UserRole } from '../types'; 
import type { Store } from '../types';
import { useAuth } from '../contexts/AuthContext'; 
import { useFetchGuard } from '../hooks/useFetchGuard'; 

const AdminManageStores: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, initialized } = useAuth();

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  // 업소 데이터 호출 함수
  const fetchStores = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setStores(data as Store[]);
    } catch (err: any) {
      console.error('Inventory Sync Failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useFetchGuard(fetchStores, []);

  // 🔴 새로고침 시 홈으로 튕김 방지 로직 (initialized 확인)
  useEffect(() => {
    if (initialized) {
      if (!currentUser || currentUser.role !== UserRole.ADMIN) {
        navigate('/', { replace: true });
      }
    }
  }, [initialized, currentUser, navigate]);

  /**
   * HOT 설정 토글 - 즉시 UI 반영 (Optimistic UI)
   */
  const toggleHotStatus = async (storeId: string, currentStatus: boolean) => {
    // 로컬 상태 먼저 변경
    const updatedStores = stores.map(s => 
      s.id === storeId ? { ...s, is_hot: !currentStatus } : s
    );
    setStores(updatedStores);

    try {
      const { error } = await supabase
        .from('stores')
        .update({ is_hot: !currentStatus })
        .eq('id', storeId);
      
      if (error) {
        setStores(stores); // 에러 시 롤백
        throw error;
      }
    } catch (err) {
      alert('상태 변경에 실패했습니다. 관리자 권한을 확인하세요.');
    }
  };

  const deleteStore = async (storeId: string) => {
    if (!window.confirm('이 업소를 정말 삭제하시겠습니까?')) return;
    try {
      const { error } = await supabase.from('stores').delete().eq('id', storeId);
      if (error) throw error;
      alert('삭제되었습니다.');
      fetchStores(); 
    } catch (err) {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  if (!initialized || (loading && stores.length === 0)) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-white font-black italic animate-pulse tracking-widest uppercase text-xl">
        Accessing Store Inventory...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans selection:bg-red-600/30">
      <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
              Store <span className="text-red-600">Inventory</span>
            </h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-4 ml-1 italic">
              업소 현황 및 HOT 섹션 제어
            </p>
          </div>
          <button onClick={() => navigate('/admin/create-store')} className="px-8 py-4 bg-red-600 text-white text-xs font-black rounded-xl uppercase italic hover:bg-red-700 transition-all shadow-2xl active:scale-95 shadow-red-900/20">
            + Add New Intelligence
          </button>
        </header>

        <div className="bg-[#111] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl text-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/5 text-[10px] font-black uppercase text-gray-500 italic tracking-widest">
                  <th className="p-6">업소 정보</th>
                  <th className="p-6">카테고리</th>
                  <th className="p-6 text-center">HOT 설정</th>
                  <th className="p-6 text-right">관리 액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stores.map((store) => (
                  <tr key={store.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-xl bg-slate-800 overflow-hidden border border-white/10 shrink-0 shadow-lg">
                          <img src={store.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="max-w-[300px]">
                          <p className="font-black text-white text-sm mb-1 italic tracking-tight uppercase leading-tight">{store.name}</p>
                          <p className="text-gray-600 text-[10px] font-bold italic truncate tracking-tighter">{store.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="text-[9px] font-black uppercase bg-white/5 px-2.5 py-1 rounded-md text-gray-400 border border-white/5 italic">#{store.category}</span>
                    </td>
                    <td className="p-6 text-center">
                      <button 
                        onClick={() => toggleHotStatus(store.id, store.is_hot)}
                        className={`px-5 py-2 rounded-full text-[9px] font-black uppercase italic transition-all active:scale-90 ${
                          store.is_hot 
                          ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' 
                          : 'bg-white/5 text-gray-500 border border-white/10 hover:border-red-600/30'
                        }`}
                      >
                        {store.is_hot ? '🔥 Hot Active' : 'Set Hot'}
                      </button>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => navigate(`/store/${store.id}`)} className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all border border-white/5 shadow-md">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button onClick={() => navigate(`/admin/edit-store/${store.id}`)} className="p-3 bg-emerald-600/5 rounded-xl text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all border border-emerald-600/10">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => deleteStore(store.id)} className="p-3 bg-red-600/5 rounded-xl text-red-600 hover:bg-red-600 hover:text-white transition-all border border-red-600/10">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManageStores;
