import React, { useState, useEffect } from 'react'; // 🔴 useEffect 추가
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { UserRole } from '../types'; 
import { useAuth } from '../contexts/AuthContext'; 
import { useFetchGuard } from '../hooks/useFetchGuard'; 

const AdminManageCoupons: React.FC = () => {
  const navigate = useNavigate();
  
  // 1. 전역 인증 상태 구독 (initialized 추가)
  const { currentUser, initialized } = useAuth();

  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * 🔴 [방탄 fetch] 전역 쿠폰 데이터베이스 동기화
   */
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
    } catch (err: any) {
      console.error('Coupon Archive Sync Failed:', err.message);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔴 [데이터 가드 적용] 
   */
  useFetchGuard(fetchAllCoupons, []);

  // 2. 관리자 권한 최종 보안 가드 (새로고침 튕김 방지 핵심)
  useEffect(() => {
    if (initialized) {
      if (!currentUser || currentUser.role !== UserRole.ADMIN) {
        navigate('/', { replace: true });
      }
    }
  }, [initialized, currentUser, navigate]);

  /**
   * 🔴 쿠폰 강제 회수 액션
   */
  const handleRevoke = async (couponId: string, userName: string) => {
    if (!window.confirm(`[${userName}] 유저의 쿠폰을 강제 회수하시겠습니까? 데이터는 복구되지 않습니다.`)) return;

    try {
      const { error } = await supabase.from('coupons').delete().eq('id', couponId);
      if (error) throw error;
      
      alert('쿠폰이 성공적으로 회수되었습니다.');
      setCoupons(prev => prev.filter(c => c.id !== couponId));
    } catch (err: any) {
      alert('회수 처리 중 오류가 발생했습니다.');
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.user?.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔴 세션 확인 중일 때의 로딩 화면 (Tony님 디자인 일관성)
  if (!initialized || (loading && coupons.length === 0)) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-red-600 font-black animate-pulse uppercase tracking-[0.3em] text-xl italic">
        쿠폰 데이터 동기화 중...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans selection:bg-red-600/30">
      <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <div>
            <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">
              Coupon <span className="text-red-600">Control</span>
            </h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] ml-1 italic">
              발급된 모든 쿠폰의 실시간 상태 감시 및 강제 회수 제어 모듈
            </p>
          </div>
          <input 
            type="text" 
            placeholder="소유자 또는 쿠폰명 검색..." 
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
                  <th className="px-10 py-8">소유자 정보</th>
                  <th className="px-10 py-8">쿠폰 상세</th>
                  <th className="px-10 py-8">사용 상태</th>
                  <th className="px-10 py-8 text-right">관리 명령</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCoupons.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-24 text-center text-gray-700 font-bold italic uppercase tracking-widest opacity-50">
                      검색된 쿠폰 데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-white/[0.01] group transition-colors">
                      <td className="px-10 py-8">
                        <div className="flex flex-col">
                          <span className="text-white font-black italic text-lg tracking-tight uppercase">{coupon.user?.nickname}</span>
                          <span className="text-[10px] text-gray-600 font-bold tracking-tighter italic opacity-80">{coupon.user?.email}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <p className="text-white font-black italic mb-1 uppercase tracking-tight">{coupon.title}</p>
                        <p className="text-[10px] text-gray-500 italic opacity-70">{coupon.content}</p>
                      </td>
                      <td className="px-10 py-8">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase italic ${
                          coupon.is_used 
                          ? 'bg-gray-800 text-gray-500' 
                          : 'bg-red-600/10 text-red-600 border border-red-600/20 shadow-[0_0_15px_rgba(220,38,38,0.15)]'
                        }`}>
                          {coupon.is_used ? '사용 완료' : '사용 가능'}
                        </span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <button 
                          onClick={() => handleRevoke(coupon.id, coupon.user?.nickname)} 
                          className="opacity-0 group-hover:opacity-100 px-6 py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase italic transition-all hover:bg-red-700 shadow-xl active:scale-95 shadow-red-900/20"
                        >
                          회수하기
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
