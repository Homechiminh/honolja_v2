import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import type { User } from '../types';

const Community: React.FC<{ currentUser: User | null }> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: '전체피드', icon: '🌍' },
    { id: 'free', name: '자유게시판', icon: '💬' },
    { id: 'review', name: '업소후기', icon: '📸' },
    { id: 'qna', name: '질문/답변', icon: '🙋' },
    { id: 'food', name: '맛집/관광', icon: '🍜' },
    { id: 'business', name: '부동산/비즈니스', icon: '🏢' },
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      let query = supabase.from('posts').select('*, author:profiles(nickname, avatar_url, level)').order('created_at', { ascending: false });
      if (activeCategory !== 'all') query = query.eq('category', activeCategory);
      const { data } = await query;
      if (data) setPosts(data);
    };
    fetchPosts();
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 md:px-10">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
        <aside className="lg:w-80 space-y-6">
          <div className="bg-[#111] p-6 rounded-[2.5rem] border border-yellow-600/20">
            <h3 className="text-yellow-500 font-black mb-4">👑 VET ONLY</h3>
            <button onClick={() => navigate('/vip-lounge')} className="w-full py-4 bg-yellow-600 text-black font-black rounded-2xl text-xs">베테랑 라운지 입장</button>
          </div>
          <div className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5">
            <nav className="space-y-2">
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black ${activeCategory === cat.id ? 'bg-red-600 text-white' : 'text-gray-500 hover:bg-white/5'}`}>
                  <span>{cat.icon}</span> <span className="italic uppercase tracking-tighter">{cat.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1">
          <header className="flex justify-between items-center mb-10">
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">{activeCategory} Feed</h2>
            <button onClick={() => navigate('/community/create')} className="px-8 py-4 bg-red-600 text-white font-black rounded-2xl uppercase italic">글쓰기</button>
          </header>
          <div className="space-y-4">
            {posts.map(post => (
              <Link key={post.id} to={`/post/${post.id}`} className="block bg-[#111] p-8 rounded-[2.5rem] border border-white/5 hover:border-red-600 transition-all">
                <h3 className="text-2xl font-black text-white italic mb-2">{post.title}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-500 italic">
                  <span>{post.author?.nickname}</span>
                  <span>LV.{post.author?.level}</span>
                  <span>👁️ {post.views || 0}</span>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Community;
