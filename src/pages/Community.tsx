import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import type { User } from '../types';

const Community: React.FC<{ currentUser: User | null }> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  
  // 🔴 검색 및 정렬 상태 추가
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'likes' | 'views'>('created_at');

  const categories = [
    { id: 'all', name: '전체피드', icon: '🌍' },
    { id: 'free', name: '자유게시판', icon: '💬' },
    { id: 'review', name: '업소후기', icon: '📸' },
    { id: 'qna', name: '질문/답변', icon: '🙋' },
    { id: 'food', name: '맛집/관광', icon: '🍜' },
    { id: 'business', name: '부동산/비즈니스', icon: '🏢' },
  ];

  useEffect(() => {
    fetchPosts();
  }, [activeCategory, sortBy]); // 정렬 변경 시 리로드

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase
      .from('posts')
      .select('*, author:profiles(nickname, avatar_url, level)')
      .order(sortBy, { ascending: false }); // 🔴 동적 정렬 적용

    if (activeCategory !== 'all') query = query.eq('category', activeCategory);
    
    // 🔴 검색어 필터링
    if (searchQuery) query = query.ilike('title', `%${searchQuery}%`);

    const { data } = await query;
    if (data) setPosts(data);
    setLoading(false);
  };

  const handleCreatePost = () => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    navigate('/community/create');
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 md:px-10">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
        <aside className="lg:w-80 space-y-6">
          <div className={`p-6 rounded-[2.5rem] border ${currentUser?.level && currentUser.level >= 3 ? 'bg-yellow-600 border-yellow-500' : 'bg-[#111] border-white/5 opacity-80'}`}>
            <h3 className={`font-black italic uppercase mb-4 ${currentUser?.level && currentUser.level >= 3 ? 'text-black' : 'text-yellow-600'}`}>
              {currentUser?.level && currentUser.level >= 3 ? '👑 Veteran Lounge' : '🔒 Veteran Only'}
            </h3>
            <button onClick={() => navigate('/vip-lounge')} className={`w-full py-4 rounded-2xl font-black text-xs ${currentUser?.level && currentUser.level >= 3 ? 'bg-black text-yellow-500' : 'bg-white/5 text-gray-600'}`}>
              라운지 입장
            </button>
          </div>
          <div className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5">
            <nav className="space-y-2">
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black ${activeCategory === cat.id ? 'bg-red-600 text-white' : 'text-gray-500'}`}>
                  <span>{cat.icon}</span> <span>{cat.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <h2 className="text-4xl font-black text-white italic uppercase">{activeCategory} Feed</h2>
            <div className="flex gap-4 w-full md:w-auto">
              {/* 🔴 검색창 UI */}
              <input 
                type="text" 
                placeholder="제목 검색..." 
                className="bg-[#111] border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-red-600"
                onKeyDown={(e) => e.key === 'Enter' && fetchPosts()}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-[#111] border border-white/10 rounded-xl px-4 py-2 text-xs text-gray-400">
                <option value="created_at">최신순</option>
                <option value="likes">추천순</option>
                <option value="views">조회순</option>
              </select>
              <button onClick={handleCreatePost} className="px-6 py-2 bg-red-600 text-white font-black rounded-xl uppercase italic">글쓰기</button>
            </div>
          </header>

          <div className="space-y-4">
            {loading ? <div className="py-20 text-center text-gray-600 font-black">LOADING...</div> : posts.map(post => (
              <Link key={post.id} to={`/post/${post.id}`} className="block bg-[#111] p-8 rounded-[2.5rem] border border-white/5 hover:border-red-600/50 transition-all group">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black text-white italic group-hover:text-red-500 mb-4">{post.title}</h3>
                    <div className="flex items-center gap-4 text-[10px] text-gray-600 font-black uppercase">
                      <span className="text-red-600">#{post.category}</span>
                      <span>{post.author?.nickname} Lv.{post.author?.level}</span>
                      <span>👁️ {post.views || 0}</span>
                    </div>
                  </div>
                  <div className="text-center bg-black/40 px-6 py-3 rounded-2xl border border-white/5">
                    <p className="text-[8px] text-gray-600 font-black uppercase mb-1">Recommended</p>
                    <p className="text-red-600 font-black text-xl italic">+{post.likes || 0}</p>
                  </div>
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
