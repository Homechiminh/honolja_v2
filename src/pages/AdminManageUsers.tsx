import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { User, UserRole } from '../types';

const AdminManageUsers: React.FC<{ currentUser: User | null }> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [inputAmounts, setInputAmounts] = useState<{ [key: string]: string }>({});

  const levelNames: { [key: number]: string } = {
    1: '여행자', 2: '방랑자', 3: '베테랑', 4: 'VIP'
  };

  if (currentUser?.role !== UserRole.ADMIN) {
    navigate('/');
    return null;
  }

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleUpdatePoints = async (userId: string, currentPoints: number, amount: number) => {
    if (!amount) return;
    const { error } = await supabase.from('profiles').update({ points: currentPoints + amount }).eq('id', userId);
    if (!error) {
      setInputAmounts({ ...inputAmounts, [userId]: '' });
      fetchUsers();
    }
  };

  const updateLevel = async (userId: string, newLevel: number) => {
    await supabase.from('profiles').update({ level: newLevel }).eq('id', userId);
    fetchUsers();
  };

  const toggleBlock = async (userId: string, currentStatus: boolean) => {
    if (!confirm('상태를 변경하시겠습니까?')) return;
    await supabase.from('profiles').update({ is_blocked: !currentStatus }).eq('id', userId);
    fetchUsers();
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-black text-white italic mb-12 uppercase tracking-tighter">User <span className="text-emerald-500">Control</span></h2>
        
        <div className="bg-[#111] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <table className="w-full text-left text-white">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black uppercase text-gray-500">
                <th className="p-6">User Info</th>
                <th className="p-6 text-center">Level</th>
                <th className="p-6">Point Control (Direct & Quick)</th>
                <th className="p-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className={user.is_blocked ? 'opacity-30 grayscale' : ''}>
                  <td className="p-6 text-sm font-black">{user.nickname}<br/><span className="text-[10px] text-gray-600">{user.email}</span></td>
                  <td className="p-6 text-center">
                    <select value={user.level} onChange={(e) => updateLevel(user.id, parseInt(e.target.value))} className="bg-black border border-white/10 rounded-lg text-[11px] px-3 py-1.5 outline-none">
                      {[1,2,3,4].map(lv => <option key={lv} value={lv}>Lv.{lv} {levelNames[lv]}</option>)}
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
                        <input type="number" placeholder="Amt" value={inputAmounts[user.id] || ''} onChange={(e) => setInputAmounts({...inputAmounts, [user.id]: e.target.value})} className="bg-black border border-white/10 rounded-lg px-3 py-1.5 text-[11px] w-20 outline-none" />
                        <button onClick={() => handleUpdatePoints(user.id, user.points, parseInt(inputAmounts[user.id]))} className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-black rounded-lg uppercase italic">지급</button>
                        <button onClick={() => handleUpdatePoints(user.id, user.points, -parseInt(inputAmounts[user.id]))} className="px-3 py-1.5 bg-red-600 text-white text-[10px] font-black rounded-lg uppercase italic">차감</button>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button onClick={() => toggleBlock(user.id, user.is_blocked)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${user.is_blocked ? 'bg-white text-black' : 'bg-red-600/10 text-red-500 border border-red-600/20'}`}>
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
