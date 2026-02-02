import React, { useState, useEffect } from 'react'; // 🔴 useEffect 추가
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { LEVEL_NAMES, UserRole } from '../types'; 
import type { User } from '../types';
import { useAuth } from '../contexts/AuthContext'; 
import { useFetchGuard } from '../hooks/useFetchGuard'; 

const AdminManageUsers: React.FC = () => {
  const navigate = useNavigate();
  
  // 1. 전역 인증 상태 구독 (initialized 추가)
  const { currentUser, initialized } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputAmounts, setInputAmounts] = useState<{ [key: string]: string }>({});

  /**
   * 🔴 [방탄 fetch] 유저 데이터베이스 동기화
   */
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setUsers(data as User[]);
    } catch (err: any) {
      console.error('User Archive Sync Failed:', err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useFetchGuard(fetchUsers, []);

  // 2. 관리자 권한 최종 보안 가드 (새로고침 튕김 방지 핵심)
  useEffect(() => {
    if (initialized) {
      if (!currentUser || currentUser.role !== UserRole.ADMIN) {
        navigate('/', { replace: true });
      }
    }
  }, [initialized, currentUser, navigate]);

  /**
   * 🔴 포인트 업데이트 함수
   */
  const handleUpdatePoints = async (userId: string, currentPoints: number, amount: number) => {
    if (isNaN(amount) || amount === 0) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ points: currentPoints + amount })
        .eq('id', userId);
      
      if (error) throw error;
      
      setInputAmounts({ ...inputAmounts, [userId]: '' });
      await fetchUsers(); 
    } catch (err) {
      alert('포인트 업데이트에 실패했습니다.');
    }
  };

  /**
   * 🔴 등급 변경 함수
   */
  const updateLevel = async (userId: string, newLevel: number) => {
    try {
      const { error } = await supabase.from('profiles').update({ level: newLevel }).eq('id', userId);
      if (error) throw error;
      await fetchUsers();
    } catch (err) {
      alert('등급 변경에 실패했습니다.');
    }
  };

  /**
   * 🔴 유저 차단 토글
   */
  const toggleBlock = async (userId: string, currentStatus: boolean) => {
    const actionText = currentStatus ? '차단 해제' : '계정 차단';
    if (!confirm(`이 유저를 ${actionText} 하시겠습니까?`)) return;
    try {
      const { error } = await supabase.from('profiles').update({ is_blocked: !currentStatus }).eq('id', userId);
      if (error) throw error;
      await fetchUsers();
    } catch (err) {
      alert('상태 변경에 실패했습니다.');
    }
  };

  // 🔴 세션 확인 및 초기 로딩 가드
  if (!initialized || (loading && users.length === 0)) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-emerald-500 font-black italic animate-pulse tracking-widest uppercase text-xl">
          회원 데이터베이스 분석 중...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans text-white selection:bg-emerald-600/30">
      <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
        <header className="mb-12">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
            회원 <span className="text-emerald-500">관리 센터</span>
          </h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-4 ml-1 italic">
            전체 유저 권한 제어 및 등급/포인트 정밀 조정 시스템
          </p>
        </header>

        <div className="bg-[#111] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-white/5 border-b border-white/5 text-[10px] font-black uppercase text-gray-500 italic tracking-widest">
                <th className="p-6">회원 정보</th>
                <th className="p-6 text-center">등급 변경</th>
                <th className="p-6">포인트 제어</th>
                <th className="p-6 text-right">상태 제어</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className={`hover:bg-white/[0.02] transition-colors ${user.is_blocked ? 'opacity-30 grayscale' : ''}`}>
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black italic border border-white/5 text-emerald-500 shadow-inner">
                        {user.nickname?.[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-white italic">{user.nickname}</p>
                        <p className="text-gray-600 text-[10px] font-bold italic tracking-tight">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <select 
                      value={user.level} 
                      onChange={(e) => updateLevel(user.id, parseInt(e.target.value))}
                      className="bg-black border border-white/10 rounded-lg px-3 py-1.5 text-[11px] font-black outline-none focus:border-emerald-500 italic"
                    >
                      {[1, 2, 3, 4].map(lv => (
                        <option key={lv} value={lv}>Lv.{lv} {LEVEL_NAMES[lv]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-500 font-black text-sm w-20 text-right italic">{user.points.toLocaleString()} P</span>
                        <div className="flex gap-1">
                          {[-100, -10, 10, 100].map(val => (
                            <button key={val} onClick={() => handleUpdatePoints(user.id, user.points, val)} className="px-2 py-1 bg-white/5 text-[9px] font-black rounded hover:bg-emerald-600 hover:text-white transition-all">{val > 0 ? `+${val}` : val}</button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <input type="number" placeholder="금액" value={inputAmounts[user.id] || ''} onChange={(e) => setInputAmounts({...inputAmounts, [user.id]: e.target.value})} className="bg-black border border-white/10 rounded-lg px-3 py-1.5 text-[11px] w-20 outline-none placeholder:text-gray-800 font-bold shadow-inner text-white" />
                        <button onClick={() => handleUpdatePoints(user.id, user.points, parseInt(inputAmounts[user.id] || '0'))} className="px-3 py-1 bg-emerald-600 text-[10px] font-black rounded-lg uppercase italic hover:bg-emerald-500 transition-colors shadow-lg">지급</button>
                        <button onClick={() => handleUpdatePoints(user.id, user.points, -parseInt(inputAmounts[user.id] || '0'))} className="px-3 py-1 bg-red-600 text-[10px] font-black rounded-lg uppercase italic hover:bg-red-500 transition-colors shadow-lg">차감</button>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button onClick={() => toggleBlock(user.id, user.is_blocked)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${user.is_blocked ? 'bg-white text-black shadow-xl scale-105' : 'bg-red-600/10 text-red-500 border border-red-600/20 hover:bg-red-600 hover:text-white'}`}>
                      {user.is_blocked ? '차단 해제' : '접속 차단'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && !loading && (
            <div className="py-32 text-center">
              <p className="text-gray-700 font-black italic uppercase tracking-widest">등록된 회원 정보가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManageUsers;
