import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext'; 

const AdminDashboard: React.FC = () => {
  const { currentUser, initialized } = useAuth(); 

  /**
   * [튕김 방지 로직]
   * App.tsx의 AdminRoute가 권한을 지키고 있으므로, 
   * 페이지 내부에서는 세션 초기화(initialized) 대기 화면만 제공합니다.
   */

  // 세션 확인 중일 때는 대기 화면 노출
  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-red-600 font-black animate-pulse tracking-widest uppercase italic text-xl">
          Syncing System Intelligence...
        </div>
      </div>
    );
  }

  // 관리자가 아닐 경우 렌더링 차단 (보안 유지)
  if (!currentUser || currentUser.role !== UserRole.ADMIN) return null;

  const menuItems = [
    {
      title: '새 업소 등록',
      desc: '신규 마사지, 가라오케, 숙소 등을 시스템에 추가합니다.',
      icon: '➕',
      path: '/admin/create-store',
      color: 'bg-red-600'
    },
    {
      title: '업소 현황 관리',
      desc: '등록된 전체 업소의 정보 수정, HOT 설정 및 삭제 관리.',
      icon: '📋',
      path: '/admin/manage-stores',
      color: 'bg-orange-600'
    },
    {
      title: '회원 관리 센터',
      desc: '유저 등급 조정, 포인트 관리 및 활동 정지 처리.',
      icon: '👥',
      path: '/admin/manage-users',
      color: 'bg-emerald-600'
    },
    {
      title: '쿠폰/이벤트 관리',
      desc: '발급된 전체 쿠폰 조회 및 부적절한 쿠폰 회수(삭제).',
      icon: '🎟️',
      path: '/admin/manage-coupons',
      color: 'bg-yellow-600'
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans selection:bg-red-600/30">
      <Helmet>
        <title>관리자 | 시스템 대시보드</title>
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <header className="mb-16">
          <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">
            System <span className="text-red-600">Dashboard</span>
          </h2>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-red-600 rounded-full animate-ping"></span>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] italic">
              Admin Control Center · <span className="text-white">{currentUser.nickname}</span> Manager Online
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} className="group">
              <div className="bg-[#111] border border-white/5 p-10 rounded-[3rem] hover:border-red-600/50 transition-all shadow-2xl hover:-translate-y-3 duration-500 h-full flex flex-col relative overflow-hidden">
                <div className={`${item.color} w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-8 shadow-2xl group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <h3 className="text-2xl font-black text-white italic mb-4 uppercase tracking-tighter leading-tight break-keep">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-xs font-medium leading-relaxed opacity-80 break-keep">
                  {item.desc}
                </p>
                <div className="mt-auto pt-10 flex justify-between items-center border-t border-white/5">
                  <span className="text-[10px] font-black text-white/10 group-hover:text-red-600 transition-colors uppercase tracking-[0.2em] italic">Access Module</span>
                  <span className="text-white/5 group-hover:text-red-600 transition-colors text-xl">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
