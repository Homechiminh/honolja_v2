import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext'; 

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

  // 🔴 fetchPosts에서 fetchGuard를 제거하고 직접 호출 (비로그인 접근 허용)
  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select('*, author:profiles(nickname, avatar_url, level)')
        .neq('category', 'vip')
        .order(sortBy, { ascending: false });

      if (activeCategory !== 'all') {
        query = query.eq('category', activeCategory);
      }
      
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPosts(data || []);
    } catch (err: any) {
      console.error('Community Fetch Failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialized) fetchPosts();
  }, [initialized, activeCategory, sortBy]);

  const handleCreatePost = () => {
    if (!currentUser) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }
    navigate('/community/create');
  };

  const handleVIPAccess = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUser || currentUser.level < 3) {
      alert('VIP 라운지는 Lv.3(베테랑) 이상만 입장 가능합니다.');
    } else {
      navigate('/vip-lounge');
    }
  };

  if (!initialized) return null;

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 md:px-10 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
        
        <aside className="lg:w-80 space-y-6">
          {/* 🔴 VIP 라운지 바로가기 버튼 */}
          <button 
            onClick={handleVIPAccess}
            className="w-full py-6 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-[2rem] border border-yellow-400/30 flex items-center justify-center gap-4 group hover:scale-[1.02] transition-all shadow-2xl"
          >
            <span className="text-2xl">👑</span>
            <span className="text-black font-black italic uppercase tracking-tighter">VIP LOUNGE ACCESS</span>
          </button>

          <div className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
            <nav className="space-y-2">
              {categories.map((cat) => (
                <button 
                  key={cat.id} 
                  onClick={() => setActiveCategory(cat.id)} 
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${
                    activeCategory === cat.id ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span> 
                  <span className="italic uppercase text-sm">{cat.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter">
              {activeCategory} <span className="text-red-600">Feed</span>
            </h2>
            
            <div className="flex flex-wrap gap-4">
              <input type="text" placeholder="검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchPosts()} className="bg-[#111] border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-red-600" />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-400 font-bold cursor-pointer">
                <option value="created_at">최신순</option>
                <option value="likes">인기순</option>
                <option value="views">조회순</option>
              </select>
              <button onClick={handleCreatePost} className="px-8 py-3 bg-red-600 text-white font-black rounded-xl uppercase italic text-sm">글쓰기</button>
            </div>
          </header>

          <div className="space-y-6">
            {loading ? <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin inline-block"></div></div> :
              posts.length === 0 ? <div className="py-32 text-center text-gray-700 font-black italic uppercase">게시글이 없습니다.</div> :
              posts.map(post => (
                <Link key={post.id} to={`/post/${post.id}`} className="block bg-[#111] p-8 md:p-10 rounded-[2.5rem] border border-white/5 hover:border-red-600/50 transition-all group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-2xl md:text-3xl font-black text-white italic group-hover:text-red-500 mb-6 transition-colors">{post.title}</h3>
                      <div className="flex items-center gap-5 text-[10px] text-gray-500 font-black uppercase italic tracking-widest">
                        <span className="text-red-600">#{post.category}</span>
                        <span>{post.author?.nickname || 'Guest'}</span>
                        <span>👁️ {post.views || 0}</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-red-600 font-black text-2xl italic">+{post.likes || 0}</p>
                    </div>
                  </div>
                </Link>
              ))
            }
          </div>
        </main>
      </div>
    </div>
  );
};

export default Community;
