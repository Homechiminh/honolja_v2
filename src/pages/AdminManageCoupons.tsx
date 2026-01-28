import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { UserRole } from '../types';
import type { User } from '../types';

const AdminManageCoupons: React.FC<{ currentUser: User | null }> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. 관리자 권한 체크 및 데이터 로드
  useEffect(() => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      alert('관리자 전용 페이지입니다.');
      navigate('/');
      return;
    }
    fetchAllCoupons();
  }, [currentUser, navigate]);

  // 2. 전체 쿠폰 및 소유자 정보 가져오기
  const fetchAllCoupons = async () => {
    setLoading(true);
    try {
      // coupons 테이블과 profiles 테이블을 조인하여 닉네임과 이메일을 함께 가져옴
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
    } catch (err: any) {
      alert('쿠폰 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 🔴 3. 쿠폰 회수(영구 삭제) 처리
  const handleRevoke = async (couponId: string, userName: string) => {
    const confirmMsg = `[${userName}] 님의 쿠폰을 정말 회수하시겠습니까?\n회수 시 유저의 쿠폰함에서 즉시 삭제됩니다.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', couponId);

      if (error) throw error;

      alert('쿠폰이 성공적으로 회수되었습니다.');
      // 리스트 즉시 갱신
      setCoupons(prev => prev.filter(c => c.id !== couponId));
    } catch (err: any) {
      alert('회수 처리 중 오류가 발생했습니다.');
    }
  };

  // 4. 검색 필터링 (닉네임 또는 쿠폰명)
  const filteredCoupons = coupons.filter(c => 
    c.user?.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white italic animate-pulse">
      ACCESSING COUPON DATABASE...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">
              Coupon <span className="text-red-600">Management</span>
            </h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] ml-1 italic">
              Total Issued: {coupons.length} Coupons
            </p>
          </div>
          
          <input 
            type="text" 
            placeholder="유저 닉네임 또는 쿠폰명 검색..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 bg-[#111] border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-red-600 outline-none transition-all"
          />
        </header>

        <div className="bg-[#111] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] italic">
                <tr>
                  <th className="px-8 py-6">User Info</th>
                  <th className="px-8 py-6">Coupon Details</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6">Expiry Date</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCoupons.length > 0 ? filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-red-600 border border-white/5">
                          {coupon.user?.nickname?.[0]}
                        </div>
                        <div>
                          <p className="text-white font-black text-sm">{coupon.user?.nickname}</p>
                          <p className="text-[10px] text-gray-600 font-medium italic">{coupon.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-white font-bold text-sm mb-1">{coupon.title}</p>
                      <p className="text-[10px] text-gray-500 line-clamp-1">{coupon.content}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase italic ${
                        coupon.is_used 
                        ? 'bg-gray-800 text-gray-500' 
                        : 'bg-emerald-600/20 text-emerald-500'
                      }`}>
                        {coupon.is_used ? 'Used' : 'Available'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs text-gray-400 font-bold italic">
                        {new Date(coupon.expired_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleRevoke(coupon.id, coupon.user?.nickname)}
                        className="opacity-0 group-hover:opacity-100 px-5 py-2 bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase italic hover:bg-red-600 hover:text-white transition-all shadow-lg"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-32 text-center text-gray-700 font-black italic uppercase tracking-widest text-xl opacity-30">
                      No Coupons Found
                    </td>
                  </tr>
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
