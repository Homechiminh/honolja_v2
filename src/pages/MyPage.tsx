import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { UserRole } from '../types';
import type { User } from '../types';

interface MyPageProps {
  currentUser: User | null;
}

const MyPage: React.FC<MyPageProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'posts' | 'history'>('posts');

  // 1. 로그아웃 로직: Supabase 세션을 종료하고 홈으로 보냅니다.
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert('로그아웃 중 에러가 발생했습니다.');
    } else {
      navigate('/');
    }
  };

  // 2. 비로그인 상태 처리: App.tsx에서 loading 처리를 하지만, 안전을 위해 한 번 더 체크합니다.
  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-20 text-center min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-3xl font-black mb-8 italic text-white uppercase tracking-tighter">Access Denied</h2>
        <p className="text-slate-500 mb-10 font-medium">더 많은 혜택과 커뮤니티 활동을 위해 로그인해 주세요.</p>
        <Link to="/login" className="px-12 py-5 bg-red-600 text-white rounded-2xl font-black text-xl shadow-2xl hover:scale-105 transition-transform">
          로그인하러 가기
        </Link>
      </div>
    );
  }

  const isAdmin = currentUser.role === UserRole.ADMIN;

  // 가상의 활동 데이터 (추후 DB 연동 예정)
  const stats = { posts: 0, comments: 0, likesReceived: 0 };

  return (
    <div className="container mx-auto px-4 py-32 max-w-5xl min-h-screen font-sans">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] rounded-[3rem] border border-white/5 p-8 md:p-12 mb-8 shadow-2xl relative overflow-hidden">
        {/* 등급 표시 뱃지 */}
        <div className={`absolute top-0 right-0 px-8 py-3 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest ${isAdmin ? 'bg-red-600 text-white' : 'bg-yellow-500 text-black'}`}>
          {isAdmin ? 'System Admin' : 'Official Member'}
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* 프로필 이미지 영역 */}
          <div className="relative shrink-0">
            <div className={`w-32 h-32 rounded-[2.5rem] p-1.5 border-2 ${isAdmin ? 'border-red-600' : 'border-yellow-600'} shadow-2xl overflow-hidden bg-slate-900`}>
               {currentUser.profile_image ? (
                 <img src={currentUser.profile_image} alt="Profile" className="w-full h-full rounded-[2rem] object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-white font-black text-5xl italic bg-gradient-to-br from-slate-700 to-slate-900">
                   {currentUser.nickname[0].toUpperCase()}
                 </div>
               )}
            </div>
          </div>

          {/* 사용자 텍스트 정보 */}
          <div className="text-center lg:text-left flex-grow">
            <h2 className="text-4xl font-black text-white mb-3 tracking-tighter italic">{currentUser.nickname} 님</h2>
            <p className="text-slate-500 font-bold mb-6 italic">{currentUser.email}</p>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
               {isAdmin && (
                 <Link to="/admin/create-store" className="px-6 py-2 bg-red-600 text-white text-[11px] font-black rounded-xl hover:bg-red-700 transition-all shadow-xl uppercase tracking-widest">
                   Admin Dashboard
                 </Link>
               )}
               <button onClick={handleLogout} className="px-6 py-2 bg-slate-900 text-slate-500 text-[11px] font-black rounded-xl hover:text-white transition-all uppercase tracking-widest border border-white/5">
                 Logout
               </button>
            </div>
          </div>

          {/* 포인트 박스 */}
          <div className="bg-black/60 px-8 py-6 rounded-[2rem] border border-white/5 text-center min-w-[200px]">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">My Points</p>
            <p className="text-3xl font-black text-red-600 tracking-tighter">{currentUser.points.toLocaleString()} P</p>
          </div>
        </div>
      </div>

      {/* 활동 스탯 로우 */}
      <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { label: '작성한 게시글', value: stats.posts, color: 'text-blue-500' },
            { label: '작성한 댓글', value: stats.comments, color: 'text-emerald-500' },
            { label: '받은 추천수', value: stats.likesReceived, color: 'text-red-500' }
          ].map((stat, i) => (
            <div key={i} className="bg-[#111] p-6 rounded-3xl border border-white/5 text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color} tracking-tighter`}>{stat.value}</p>
            </div>
          ))}
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex space-x-2 mb-8 bg-[#111] p-1.5 rounded-2xl border border-white/5">
        {[
          { id: 'posts', label: '내 활동 내역', icon: '✍️' },
          { id: 'history', label: '포인트 이용내역', icon: '📋' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-4 rounded-xl font-black text-sm flex items-center justify-center space-x-2 transition-all ${
              activeTab === tab.id ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 영역 */}
      <div className="min-h-[300px]">
        {activeTab === 'posts' && (
          <div className="py-20 text-center bg-[#080808] rounded-[3rem] border border-dashed border-white/10 animate-in fade-in duration-500">
            <p className="text-slate-600 font-black italic uppercase tracking-tighter">작성된 게시글이 없습니다.</p>
          </div>
        )}
        {activeTab === 'history' && (
          <div className="py-20 text-center bg-[#080808] rounded-[3rem] border border-dashed border-white/10 animate-in fade-in duration-500">
            <p className="text-slate-600 font-black italic uppercase tracking-tighter">포인트 이용 내역이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPage;
