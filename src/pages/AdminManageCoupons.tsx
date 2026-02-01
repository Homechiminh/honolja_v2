import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

// 🔴 Props에서 currentUser를 제거하여 TS6133 에러를 해결했습니다.
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
      console.error('Coupon load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCoupons();
  }, []);

  const handleRevoke = async (couponId: string, userName: string) => {
    if (!window.confirm(`[${userName}] 유저의 쿠폰을 강제 회수하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;

    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', couponId);

      if (error) throw error;
      alert('회수 완료');
      setCoupons(prev => prev.filter(c => c.id !== couponId));
    } catch (err) {
      alert('회수 중 오류 발생');
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
          <div>
            <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-4">
              Coupon <span className="text-red-600">Control</span>
            </h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] ml-1 italic">
              전체 발행 쿠폰: {coupons.length}건
            </p>
          </div>
          
          <input 
            type="text" 
            placeholder="Search Nickname or Coupon..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 bg-[#111] border border-white/10 rounded-2xl px-8 py-5 text-white focus:border-red-600 outline-none transition-all italic font-bold"
          />
        </header>

        <div className="bg-[#111] rounded-[3.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/[0.03] text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] italic border-b border-white/5">
                <tr>
                  <th className="px-10 py-8">Holder</th>
                  <th className="px-10 py-8">Coupon Info</th>
                  <th className="px-10 py-8">Status</th>
                  <th className="px-10 py-8">Expiry</th>
                  <th className="px-10 py-8 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCoupons.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center text-gray-600 font-bold italic uppercase">발급된 쿠폰이 없습니다.</td>
                  </tr>
                ) : (
                  filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-10 py-8">
                        <div className="flex flex-col">
                          <span className="text-white font-black italic uppercase tracking-tight">{coupon.user?.nickname}</span>
                          <span className="text-[10px] text-gray-600 font-medium">{coupon.user?.email}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex flex-col">
                          <span className="text-white font-bold text-sm mb-1">{coupon.title}</span>
                          <span className="text-[10px] text-gray-500 line-clamp-1">{coupon.content}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase italic ${
                          coupon.is_used ? 'bg-gray-800 text-gray-500' : 'bg-red-600/10 text-red-600 border border-red-600/20'
                        }`}>
                          {coupon.is_used ? 'Used' : 'Available'}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                        <span className="text-xs text-gray-400 font-bold italic">
                          {new Date(coupon.expired_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <button 
                          onClick={() => handleRevoke(coupon.id, coupon.user?.nickname)}
                          className="px-6 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase italic hover:bg-white hover:text-red-600 transition-all shadow-lg opacity-0 group-hover:opacity-100"
                        >
                          Revoke
                        </button>
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

export default AdminManageCoupons;
