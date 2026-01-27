import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { User } from '../types';
import { UserRole } from '../types';

interface AdminDashboardProps {
  currentUser: User | null;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser }) => {
  const navigate = useNavigate();

  if (currentUser?.role !== UserRole.ADMIN) {
    navigate('/');
    return null;
  }

  const menuItems = [
    {
      title: '새 업소 등록',
      desc: '신규 마사지, 가라오케, 숙소 등을 추가합니다.',
      icon: '➕',
      path: '/admin/create-store',
      color: 'bg-red-600'
    },
    {
      title: '업소 현황 관리', // 🔴 신규 추가
      desc: '등록된 전체 업소의 정보 수정, HOT 설정 및 삭제.',
      icon: '📋',
      path: '/admin/manage-stores',
      color: 'bg-orange-600'
    },
    {
      title: '회원 관리 센터',
      desc: '등급(방랑자/베테랑 등) 조정 및 포인트/차단 관리.',
      icon: '👥',
      path: '/admin/manage-users',
      color: 'bg-emerald-600'
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">
            System <span className="text-red-600">Dashboard</span>
          </h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] ml-1 italic">
            Admin Control Center · {currentUser.nickname} 관리자 접속 중
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} className="group">
              <div className="bg-[#111] border border-white/5 p-8 rounded-[2.5rem] hover:border-red-600/50 transition-all shadow-2xl hover:-translate-y-2 duration-300 h-full flex flex-col">
                <div className={`${item.color} w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-xl`}>
                  {item.icon}
                </div>
                <h3 className="text-2xl font-black text-white italic mb-3 uppercase tracking-tighter">{item.title}</h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                <div className="mt-auto pt-6 text-[10px] font-black text-white/20 group-hover:text-red-600 transition-colors uppercase tracking-widest italic">
                  Enter Module →
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
