import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

// 🔴 currentUser 선언 제거
const AdminManageCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAllCoupons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select(`
          *,
          user:profiles (
            nickname,
            email,
            level
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (err) {
      console.error('Coupon fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCoupons();
  }, []);

  const handleRevoke = async (couponId: string, userName: string) => {
    if (!window.confirm(`[${userName}] 유저의 쿠폰을 강제 회수하시겠습니까?`)) return;

    try {
      const { error } = await supabase.from('coupons').delete().eq('id', couponId);
      if (error) throw error;
      alert('회수 완료');
      setCoupons(prev => prev.filter(c => c.id !== couponId));
    } catch (err) {
      alert('회수 오류');
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.user?.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && coupons.length === 0) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white italic animate-pulse uppercase tracking-[0.3em]">
      Syncing Coupon Database...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-4">
            Coupon <span className="text-red-600">Control</span>
          </h2>
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 bg-[#111] border border-white/10 rounded-2xl px-8 py-5 text-white outline-none italic font-bold"
          />
        </header>

        <div className="bg-[#111] rounded-[3.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-[10px] font-black text-gray-500 uppercase italic">
              <tr>
                <th className="px-10 py-8">Holder</th>
                <th className="px-10 py-8">Coupon Info</th>
                <th className="px-10 py-8">Status</th>
                <th className="px-10 py-8 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCoupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-white/[0.01] group">
                  <td className="px-10 py-8 text-white font-black italic">{coupon.user?.nickname}</td>
                  <td className="px-10 py-8">
                    <p className="text-white font-bold">{coupon.title}</p>
                    <p className="text-[10px] text-gray-500">{coupon.content}</p>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase italic ${
                      coupon.is_used ? 'bg-gray-800 text-gray-500' : 'bg-red-600/10 text-red-600 border border-red-600/20'
                    }`}>
                      {coupon.is_used ? 'Used' : 'Available'}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button onClick={() => handleRevoke(coupon.id, coupon.user?.nickname)} className="opacity-0 group-hover:opacity-100 px-6 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase italic transition-all">Revoke</button>
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

export default AdminManageCoupons;
