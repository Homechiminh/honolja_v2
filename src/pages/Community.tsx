import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext'; 
import { useFetchGuard } from '../hooks/useFetchGuard'; 

const Community: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, initialized } = useAuth(); 
  
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
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

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select('*, author:profiles(nickname, avatar_url, level)')
        .neq('category', 'vip') // 🔴 기본적으로 VIP 글은 제외
        .order(sortBy, { ascending: false });

      if (activeCategory !== 'all') {
        query = query.eq('category', activeCategory);
      }
      
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (data) setPosts(data);
    } catch (err: any) {
      console.error('Community Fetch Failed:', err.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useFetchGuard(fetchPosts, [activeCategory, sortBy]);

  if (!initialized) return null;

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 md:px-10 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
        <aside className="lg:w-80 space-y-6">
          <div className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
            <nav className="space-y-2">
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${activeCategory === cat.id ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                  <span className="text-xl">{cat.icon}</span> 
                  <span className="italic uppercase tracking-tighter text-sm">{cat.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
              {activeCategory} <span className="text-red-600">Feed</span>
            </h2>
            <button onClick={() => navigate('/community/create')} className="px-8 py-3 bg-red-600 text-white font-black rounded-xl uppercase italic shadow-xl shadow-red-600/20 hover:bg-red-700 active:scale-95 transition-all">글쓰기</button>
          </header>

          <div className="space-y-6">
            {loading ? (
              <div className="py-20 text-center"><div className="inline-block w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
              posts.map(post => (
                <Link key={post.id} to={`/post/${post.id}`} className="block bg-[#111] p-8 md:p-10 rounded-[2.5rem] border border-white/5 hover:border-red-600/50 transition-all group shadow-2xl">
                  <h3 className="text-2xl md:text-3xl font-black text-white italic group-hover:text-red-500 mb-6 transition-colors">{post.title}</h3>
                  <div className="flex items-center gap-5 text-[10px] text-gray-500 font-black uppercase italic">
                    <span className="text-red-600">#{post.category}</span>
                    <span>{post.author?.nickname}</span>
                    <span>👁️ {post.views || 0}</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Community;
