import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { User } from '../types';
import { UserRole } from '../types';

interface AdminDashboardProps {
  currentUser: User | null;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser }) => {
  const navigate = useNavigate();

  // 보안 체크: 관리자가 아니면 홈으로
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
      title: '회원 관리 센터',
      desc: '등급(방랑자/베테랑 등) 조정 및 포인트/차단 관리.',
      icon: '👥',
      path: '/admin/manage-users',
      color: 'bg-emerald-600'
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">
            System <span className="text-red-600">Dashboard</span>
          </h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] ml-1">Admin Control Center</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} className="group">
              <div className="bg-[#111] border border-white/5 p-10 rounded-[2.5rem] hover:border-red-600/50 transition-all shadow-2xl hover:-translate-y-2 duration-300">
                <div className={`${item.color} w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-xl`}>
                  {item.icon}
                </div>
                <h3 className="text-2xl font-black text-white italic mb-3 uppercase tracking-tighter">{item.title}</h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
