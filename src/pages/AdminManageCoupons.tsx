import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext'; // 🔴 중앙 컨텍스트 임포트
import { useFetchGuard } from '../hooks/useFetchGuard'; // 🔴 데이터 가드 훅 임포트

const AdminManageCoupons: React.FC = () => {
  const navigate = useNavigate();
  
  // 1. 전역 인증 상태 구독
  const { currentUser, loading: authLoading } = useAuth();

  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 2. 데이터 호출 로직
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

  // 🔴 3. [데이터 가드 적용] 
  // 인증이 완료된 것을 확인한 후, 쿠폰 데이터베이스를 안전하게 동기화합니다.
  useFetchGuard(fetchAllCoupons, []);

  // 4. 관리자 권한 최종 보안 가드
  if (!authLoading && currentUser?.role !== UserRole.ADMIN) {
    navigate('/', { replace: true });
    return null;
  }

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

  // 🔴 전체 로딩 가드 (인증 확인 중일 때)
  if (authLoading || (loading && coupons.length === 0)) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white italic animate-pulse uppercase tracking-[0.3em] font-black">
      Syncing Coupon Database...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans selection:bg-red-600/30">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <div>
            <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">
              Coupon <span className="text-red-600">Control</span>
            </h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] ml-1 italic">
              발급된 모든 쿠폰의 실시간 상태 감시 및 회수 제어
            </p>
          </div>
          <input 
            type="text" 
            placeholder="Search Holder or Title..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 bg-[#111] border border-white/10 rounded-2xl px-8 py-5 text-white outline-none italic font-bold focus:border-red-600 transition-all shadow-inner placeholder:text-gray-700"
          />
        </header>

        <div className="bg-[#111] rounded-[3.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[10px] font-black text-gray-500 uppercase italic tracking-widest border-b border-white/5">
                <tr>
                  <th className="px-10 py-8">Holder</th>
                  <th className="px-10 py-8">Coupon Info</th>
                  <th className="px-10 py-8">Status</th>
                  <th className="px-10 py-8 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCoupons.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-20 text-center text-gray-700 font-bold italic uppercase tracking-widest">No Active Coupons Found.</td>
                  </tr>
                ) : (
                  filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-white/[0.01] group transition-colors">
                      <td className="px-10 py-8">
                        <div className="flex flex-col">
                          <span className="text-white font-black italic text-lg tracking-tight">{coupon.user?.nickname}</span>
                          <span className="text-[10px] text-gray-600 font-bold">{coupon.user?.email}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <p className="text-white font-bold mb-1">{coupon.title}</p>
                        <p className="text-[10px] text-gray-500 italic">{coupon.content}</p>
                      </td>
                      <td className="px-10 py-8">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase italic ${
                          coupon.is_used 
                          ? 'bg-gray-800 text-gray-500' 
                          : 'bg-red-600/10 text-red-600 border border-red-600/20 shadow-[0_0_10px_rgba(220,38,38,0.1)]'
                        }`}>
                          {coupon.is_used ? 'Consumed' : 'Ready to Use'}
                        </span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <button 
                          onClick={() => handleRevoke(coupon.id, coupon.user?.nickname)} 
                          className="opacity-0 group-hover:opacity-100 px-6 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase italic transition-all hover:bg-red-700 shadow-lg active:scale-95"
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
