import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { supabase } from '../supabase';
import { UserRole } from '../types'; 
import type { Store } from '../types';
import { useAuth } from '../contexts/AuthContext'; 
import { useFetchGuard } from '../hooks/useFetchGuard'; 

const AdminManageStores: React.FC = () => {
  const navigate = useNavigate();
  
  // 1. 전역 인증 상태 구독
  const { currentUser, loading: authLoading } = useAuth();

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * 🔴 [방탄 fetch] 업소 인벤토리 데이터 호출
   * 406 에러나 세션 미복구 시에도 finally 블록이 로딩 스피너를 확실히 해제합니다.
   */
  const fetchStores = async () => {
    setLoading(true); // 로딩 시작
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        // 🔴 서버 거절 또는 인증 오류 발생 시 catch로 던짐
        throw error;
      }

      if (data) {
        setStores(data as Store[]);
      }
    } catch (err: any) {
      console.error('Inventory Sync Failed (406 등):', err.message);
      // 에러 발생 시 리스트 초기화로 ghost 데이터 방지
      setStores([]);
    } finally {
      // 🔴 핵심: 성공하든 실패하든 무조건 로딩 상태 해제
      setLoading(false);
    }
  };

  /**
   * 🔴 [데이터 가드 적용] 
   * 관리자 인증 확인이 완료된 최적의 타이밍에 데이터를 안전하게 동기화합니다.
   */
  useFetchGuard(fetchStores, []);

  // 2. 관리자 권한 최종 보안 가드
  if (!authLoading && currentUser?.role !== UserRole.ADMIN) {
    navigate('/', { replace: true });
    return null;
  }

  /**
   * 🔴 관리 액션 (HOT 설정) - 방탄 구조 적용
   */
  const toggleHotStatus = async (storeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('stores')
        .update({ is_hot: !currentStatus })
        .eq('id', storeId);
      
      if (error) throw error;
      await fetchStores(); // 데이터 즉시 갱신
    } catch (err) {
      alert('상태 변경 중 서버 오류가 발생했습니다.');
    }
  };

  /**
   * 🔴 관리 액션 (삭제) - 방탄 구조 적용
   */
  const deleteStore = async (storeId: string) => {
    if (!window.confirm('이 업소를 정말 삭제하시겠습니까? 데이터가 영구 삭제됩니다.')) return;
    try {
      const { error } = await supabase.from('stores').delete().eq('id', storeId);
      if (error) throw error;
      
      alert('데이터가 아카이브에서 제거되었습니다.');
      await fetchStores(); // 데이터 즉시 갱신
    } catch (err) {
      alert('삭제 처리 중 오류가 발생했습니다.');
    }
  };

  // 🔴 전체 로딩 가드 (인증 확인 중일 때의 블랙아웃 방지)
  if (authLoading || (loading && stores.length === 0)) return (
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
              등록된 업소 현황 파악 및 실시간 데이터 제어 모듈
            </p>
          </div>
          <button 
            onClick={() => navigate('/admin/create-store')}
            className="px-8 py-4 bg-red-600 text-white text-xs font-black rounded-xl uppercase italic hover:bg-red-700 transition-all shadow-2xl active:scale-95 shadow-red-900/20"
          >
            + Add New Intelligence
          </button>
        </header>

        <div className="bg-[#111] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl text-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/5 text-[10px] font-black uppercase text-gray-500 italic tracking-widest">
                  <th className="p-6">업소 정보</th>
                  <th className="p-6">카테고리 / 지역</th>
                  <th className="p-6 text-center">HOT 설정</th>
                  <th className="p-6 text-right">관리 액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stores.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-24 text-center text-gray-700 font-bold italic uppercase tracking-widest opacity-50">
                      No Registered Intelligence Found in this Sector.
                    </td>
                  </tr>
                ) : (
                  stores.map((store) => (
                    <tr key={store.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-xl bg-slate-800 overflow-hidden border border-white/10 shrink-0 shadow-lg">
                            <img src={store.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
                          </div>
                          <div className="max-w-[300px]">
                            <p className="font-black text-white text-sm mb-1 italic tracking-tight uppercase leading-tight">{store.name}</p>
                            <p className="text-gray-600 text-[10px] font-bold italic truncate tracking-tighter opacity-80">{store.address}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[9px] font-black uppercase bg-white/5 px-2.5 py-1 rounded-md text-gray-400 w-fit border border-white/5 italic">#{store.category}</span>
                          <span className="text-[10px] font-black uppercase text-red-600 ml-1 italic tracking-tighter">{store.region} Sector</span>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <button 
                          onClick={() => toggleHotStatus(store.id, store.is_hot)}
                          className={`px-5 py-2 rounded-full text-[9px] font-black uppercase italic transition-all active:scale-90 ${
                            store.is_hot 
                            ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' 
                            : 'bg-white/5 text-gray-500 border border-white/10 hover:border-red-600/30 hover:text-red-500'
                          }`}
                        >
                          {store.is_hot ? '🔥 Hot Active' : 'Set Hot'}
                        </button>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => navigate(`/store/${store.id}`)} className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all border border-white/5 shadow-md hover:bg-white/10">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                          <button onClick={() => navigate(`/admin/edit-store/${store.id}`)} className="p-3 bg-emerald-600/5 rounded-xl text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all border border-emerald-600/10 shadow-md">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => deleteStore(store.id)} className="p-3 bg-red-600/5 rounded-xl text-red-600 hover:bg-red-600 hover:text-white transition-all border border-red-600/10 shadow-md">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManageStores;
