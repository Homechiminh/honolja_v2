import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import type { User } from '../types';

const VipLounge: React.FC<{ currentUser: User | null }> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [activeSubMenu, setActiveSubMenu] = useState('시크릿 꿀정보');

  const subMenus = [
    { id: '시크릿 꿀정보', icon: '💎' },
    { id: '업소후기', icon: '📸' },
    { id: 'VIP 혜택', icon: '🎁' },
    { id: '블랙리스트', icon: '🚫' },
  ];

  useEffect(() => {
    if (!currentUser || currentUser.level < 3) {
      alert("접근 권한이 없습니다.");
      navigate('/community');
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchVipPosts = async () => {
      const { data } = await supabase.from('posts').select('*, author:profiles(nickname, level)').eq('category', 'vip').eq('sub_category', activeSubMenu).order('created_at', { ascending: false });
      if (data) setPosts(data);
    };
    fetchVipPosts();
  }, [activeSubMenu]);

  return (
    <div className="min-h-screen bg-[#050505] pt-32 px-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
        <aside className="lg:w-80">
          <div className="sticky top-28 bg-[#0f0f0f] rounded-[3rem] border border-yellow-600/10 p-10 space-y-4">
            {subMenus.map(menu => (
              <button key={menu.id} onClick={() => setActiveSubMenu(menu.id)} className={`w-full flex items-center gap-4 px-8 py-5 rounded-[1.5rem] font-black transition-all ${activeSubMenu === menu.id ? 'bg-yellow-600 text-black shadow-xl shadow-yellow-900/40' : 'text-gray-500 hover:bg-white/5'}`}>
                <span>{menu.icon}</span> <span className="italic uppercase tracking-tighter">{menu.id}</span>
              </button>
            ))}
          </div>
        </aside>
        <main className="flex-1">
          <header className="flex justify-between items-center mb-10">
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">{activeSubMenu} <span className="text-yellow-500">Intel</span></h2>
            <button onClick={() => navigate('/community/create')} className="px-10 py-5 bg-white text-black font-black rounded-2xl italic uppercase hover:bg-yellow-500">비밀 제보하기</button>
          </header>
          <div className="bg-[#0f0f0f] rounded-[3rem] border border-yellow-600/10 overflow-hidden divide-y divide-white/5">
            {posts.map(post => (
              <Link key={post.id} to={`/post/${post.id}`} className="group p-10 hover:bg-yellow-600/5 block">
                <h3 className="text-2xl font-black text-white italic group-hover:text-yellow-600 mb-4">{post.title}</h3>
                <div className="flex items-center gap-4 text-xs text-gray-500 font-black italic uppercase">
                  <span>👁️ {post.views || 0}</span>
                  <span className="text-yellow-600">Lv.{post.author?.level} {post.author?.nickname}</span>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default VipLounge;
