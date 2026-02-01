import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import type { User } from '../types';

const Community: React.FC<{ currentUser: User | null }> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  
  // 🔴 검색 및 정렬 상태
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

  // 🔴 카테고리나 정렬 기준이 바뀔 때마다 자동으로 리로드
  useEffect(() => {
    fetchPosts();
  }, [activeCategory, sortBy]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select('*, author:profiles(nickname, avatar_url, level)')
        .order(sortBy, { ascending: false });

      // 카테고리 필터링
      if (activeCategory !== 'all') {
        query = query.eq('category', activeCategory);
      }
      
      // 검색어 필터링 (제목 기준)
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      
      if (!error && data) {
        setPosts(data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    // 글쓰기 페이지 경로 (추후 생성 예정)
    navigate('/community/create');
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 md:px-10 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
        
        {/* 사이드바 섹션 */}
        <aside className="lg:w-80 space-y-6">
          {/* 베테랑 전용 라운지 배너 */}
          <div className={`p-6 rounded-[2.5rem] border transition-all ${
            currentUser?.level && currentUser.level >= 3 
            ? 'bg-yellow-600 border-yellow-500 shadow-[0_0_20px_rgba(202,138,4,0.3)]' 
            : 'bg-[#111] border-white/5 opacity-80'
          }`}>
            <h3 className={`font-black italic uppercase mb-4 ${
              currentUser?.level && currentUser.level >= 3 ? 'text-black' : 'text-yellow-600'
            }`}>
              {currentUser?.level && currentUser.level >= 3 ? '👑 Veteran Lounge' : '🔒 Veteran Only'}
            </h3>
            <button 
              onClick={() => navigate('/vip-lounge')} 
              className={`w-full py-4 rounded-2xl font-black text-xs transition-all ${
                currentUser?.level && currentUser.level >= 3 
                ? 'bg-black text-yellow-500 hover:scale-105' 
                : 'bg-white/5 text-gray-600 cursor-not-allowed'
              }`}
            >
              라운지 입장
            </button>
          </div>

          {/* 카테고리 메뉴 */}
          <div className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
            <nav className="space-y-2">
              {categories.map((cat) => (
                <button 
                  key={cat.id} 
                  onClick={() => setActiveCategory(cat.id)} 
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${
                    activeCategory === cat.id ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span> 
                  <span className="italic uppercase tracking-tighter text-sm">{cat.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* 메인 피드 섹션 */}
        <main className="flex-1">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter">
              {activeCategory} <span className="text-red-600">Feed</span>
            </h2>
            
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              <input 
                type="text" 
                placeholder="Search Title..." 
                value={searchQuery}
                className="flex-1 md:w-64 bg-[#111] border border-white/10 rounded-xl px-6 py-3 text-sm text-white outline-none focus:border-red-600 transition-all font-bold italic"
                onKeyDown={(e) => e.key === 'Enter' && fetchPosts()}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)} 
                className="bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-xs text-gray-400 font-black uppercase italic outline-none"
              >
                <option value="created_at">최신순 (Latest)</option>
                <option value="likes">추천순 (Popular)</option>
                <option value="views">조회순 (Views)</option>
              </select>
              <button 
                onClick={handleCreatePost} 
                className="px-8 py-3 bg-red-600 text-white font-black rounded-xl uppercase italic shadow-xl shadow-red-600/20 hover:bg-white hover:text-red-600 transition-all"
              >
                글쓰기
              </button>
            </div>
          </header>

          {/* 게시글 리스트 */}
          <div className="space-y-4">
            {loading ? (
              <div className="py-20 text-center text-gray-600 font-black italic animate-pulse">SYNCING DATA...</div>
            ) : posts.length === 0 ? (
              <div className="py-20 text-center bg-[#111] rounded-[2.5rem] border border-dashed border-white/10">
                <p className="text-gray-500 font-black italic uppercase">검색된 게시글이 없습니다.</p>
              </div>
            ) : (
              posts.map(post => (
                <Link 
                  key={post.id} 
                  to={`/post/${post.id}`} 
                  className="block bg-[#111] p-8 rounded-[2.5rem] border border-white/5 hover:border-red-600/50 transition-all group shadow-2xl"
                >
                  <div className="flex justify-between items-start gap-6">
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-white italic group-hover:text-red-500 mb-4 transition-colors leading-tight">
                        {post.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-[10px] text-gray-600 font-black uppercase tracking-widest">
                        <span className="text-red-600 bg-red-600/5 px-2 py-0.5 rounded border border-red-600/10">#{post.category}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-red-600 text-[8px] border border-white/10">
                            LV.{post.author?.level || 1}
                          </div>
                          <span>{post.author?.nickname || 'Guest'}</span>
                        </div>
                        <span className="ml-2 opacity-40">/</span>
                        <span>👁️ {post.views || 0}</span>
                        <span>🕒 {new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="shrink-0 text-center bg-black/40 px-6 py-4 rounded-3xl border border-white/5 min-w-[100px]">
                      <p className="text-[8px] text-gray-600 font-black uppercase mb-1 italic">Score</p>
                      <p className="text-red-600 font-black text-2xl italic">+{post.likes || 0}</p>
                    </div>
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
