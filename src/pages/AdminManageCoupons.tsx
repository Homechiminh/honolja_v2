import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../supabase';
import { UserRole } from '../types'; 
import { useAuth } from '../contexts/AuthContext'; 
import { useFetchGuard } from '../hooks/useFetchGuard'; 

const AdminManageCoupons: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, initialized } = useAuth();

  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAllCoupons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select(`*, user:profiles (nickname, email, level)`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (err: any) {
      console.error('Coupon Archive Sync Failed:', err.message);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useFetchGuard(fetchAllCoupons, []);

  // 🔴 튕김 방지 및 권한 체크 가드
  useEffect(() => {
    if (initialized) {
      if (!currentUser || currentUser.role !== UserRole.ADMIN) {
        navigate('/', { replace: true });
      }
    }
  }, [initialized, currentUser, navigate]);

  const handleRevoke = async (couponId: string, userName: string) => {
    if (!window.confirm(`[${userName}] 유저의 쿠폰을 강제 회수하시겠습니까?`)) return;
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', couponId);
      if (error) throw error;
      alert('쿠폰이 성공적으로 회수되었습니다.');
      setCoupons(prev => prev.filter(c => c.id !== couponId));
    } catch (err: any) { alert('회수 처리 중 오류 발생'); }
  };

  const filteredCoupons = coupons.filter(c => 
    c.user?.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!initialized || (loading && coupons.length === 0)) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-red-600 font-black animate-pulse uppercase tracking-[0.3em] text-xl italic">Data Decrypting...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans selection:bg-red-600/30">
      <Helmet>
        <title>관리자 | 쿠폰 통합 관리 센터</title>
        <meta name="keywords" content="베트남여행, 호치민여행, 호치민 밤문화, 호치민 유흥, 호치민여자, 호치민 관광, 호치민 커뮤니티" />
      </Helmet>

      <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
        
        {/* 🔴 상단 네비게이션: 관리자 대시보드 이동 버튼 추가 */}
        <div className="flex items-center gap-6 mb-10">
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

        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <div>
            <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">Coupon <span className="text-red-600">Control</span></h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] italic">모든 쿠폰의 사용 로그 및 실시간 상태 모니터링</p>
          </div>
          <input type="text" placeholder="소유자 또는 쿠폰명 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-96 bg-[#111] border border-white/10 rounded-2xl px-8 py-5 text-white outline-none italic font-bold focus:border-red-600 transition-all shadow-inner" />
        </header>

        <div className="bg-[#111] rounded-[3.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/5 text-[10px] font-black text-gray-500 uppercase italic tracking-widest border-b border-white/5">
                <tr>
                  <th className="px-10 py-8">소유자</th>
                  <th className="px-10 py-8">쿠폰 정보</th>
                  <th className="px-10 py-8">🔴 사용 기록 (Serial/Date)</th>
                  <th className="px-10 py-8 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCoupons.length === 0 ? (
                  <tr><td colSpan={4} className="p-24 text-center text-gray-700 font-bold italic uppercase tracking-widest opacity-50">No Data Found</td></tr>
                ) : filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-white/[0.01] group transition-colors">
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <span className="text-white font-black italic text-lg uppercase">{coupon.user?.nickname}</span>
                        <span className="text-[10px] text-gray-600 font-bold italic opacity-80">{coupon.user?.email}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <p className="text-white font-black italic mb-1 uppercase">{coupon.title}</p>
                      <p className="text-[10px] text-gray-500 italic">{coupon.content}</p>
                    </td>
                    <td className="px-10 py-8">
                      {coupon.is_used ? (
                        <div className="flex flex-col gap-1">
                          <span className="px-3 py-1 bg-gray-800 text-gray-500 rounded-lg text-[9px] font-black uppercase italic w-fit">사용 완료</span>
                          <span className="text-emerald-500 font-black text-xs italic tracking-widest">{coupon.serial_number || 'NO-SERIAL'}</span>
                          <span className="text-gray-600 text-[9px] italic">{new Date(coupon.used_at).toLocaleString()}</span>
                        </div>
                      ) : (
                        <span className="px-3 py-1 bg-red-600/10 text-red-600 border border-red-600/20 rounded-lg text-[9px] font-black uppercase italic">미사용</span>
                      )}
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button onClick={() => handleRevoke(coupon.id, coupon.user?.nickname)} className="opacity-0 group-hover:opacity-100 px-6 py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase italic hover:bg-red-700 active:scale-95 shadow-xl transition-all">회수하기</button>
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

export default AdminManageCoupons;
