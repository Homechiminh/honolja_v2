import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { LEVEL_NAMES } from '../types'; // 🔴 UserRole 제거
import type { User } from '../types';

const AdminManageUsers: React.FC = () => { // 🔴 currentUser 프롭 제거
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputAmounts, setInputAmounts] = useState<{ [key: string]: string }>({});

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setUsers(data as User[]);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdatePoints = async (userId: string, currentPoints: number, amount: number) => {
    if (isNaN(amount) || amount === 0) return;
    const { error } = await supabase
      .from('profiles')
      .update({ points: currentPoints + amount })
      .eq('id', userId);
    
    if (!error) {
      setInputAmounts({ ...inputAmounts, [userId]: '' });
      fetchUsers();
    }
  };

  const updateLevel = async (userId: string, newLevel: number) => {
    const { error } = await supabase.from('profiles').update({ level: newLevel }).eq('id', userId);
    if (!error) fetchUsers();
  };

  const toggleBlock = async (userId: string, currentStatus: boolean) => {
    if (!confirm('유저 상태를 변경하시겠습니까?')) return;
    const { error } = await supabase.from('profiles').update({ is_blocked: !currentStatus }).eq('id', userId);
    if (!error) fetchUsers();
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-emerald-500 font-black italic animate-pulse tracking-widest uppercase">
          Accessing User Database...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans text-white">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">
            User <span className="text-emerald-500">Management</span>
          </h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2 ml-1 italic">
            여행자 {'>'} 방랑자 {'>'} 베테랑 {'>'} VIP 시스템 관제
          </p>
        </header>

        <div className="bg-[#111] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-white/5 border-b border-white/5 text-[10px] font-black uppercase text-gray-500">
                <th className="p-6">유저 정보</th>
                <th className="p-6 text-center">등급 설정</th>
                <th className="p-6">포인트 (정밀 & 직접입력)</th>
                <th className="p-6 text-right">계정 상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className={`hover:bg-white/[0.02] transition-colors ${user.is_blocked ? 'opacity-30 grayscale' : ''}`}>
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black italic border border-white/5 text-emerald-500">
                        {user.nickname?.[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black">{user.nickname}</p>
                        <p className="text-gray-600 text-[10px] font-bold">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <select 
                      value={user.level} 
                      onChange={(e) => updateLevel(user.id, parseInt(e.target.value))}
                      className="bg-black border border-white/10 rounded-lg px-3 py-1.5 text-[11px] font-black outline-none focus:border-emerald-500"
                    >
                      {[1, 2, 3, 4].map(lv => (
                        <option key={lv} value={lv}>Lv.{lv} {LEVEL_NAMES[lv]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-500 font-black text-sm w-20 text-right">{user.points.toLocaleString()} P</span>
                        <div className="flex gap-1">
                          {[-100, -10, 10, 100].map(val => (
                            <button key={val} onClick={() => handleUpdatePoints(user.id, user.points, val)} className="px-2 py-1 bg-white/5 text-[9px] font-black rounded hover:bg-emerald-600 transition-all">{val > 0 ? `+${val}` : val}</button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <input type="number" placeholder="금액" value={inputAmounts[user.id] || ''} onChange={(e) => setInputAmounts({...inputAmounts, [user.id]: e.target.value})} className="bg-black border border-white/10 rounded-lg px-3 py-1.5 text-[11px] w-20 outline-none" />
                        <button onClick={() => handleUpdatePoints(user.id, user.points, parseInt(inputAmounts[user.id] || '0'))} className="px-3 py-1 bg-emerald-600 text-[10px] font-black rounded-lg uppercase italic">지급</button>
                        <button onClick={() => handleUpdatePoints(user.id, user.points, -parseInt(inputAmounts[user.id] || '0'))} className="px-3 py-1 bg-red-600 text-[10px] font-black rounded-lg uppercase italic">차감</button>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button onClick={() => toggleBlock(user.id, user.is_blocked)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${user.is_blocked ? 'bg-white text-black' : 'bg-red-600/10 text-red-500 border border-red-600/20 hover:bg-red-600 hover:text-white'}`}>
                      {user.is_blocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminManageUsers;
