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

  // --- 페이지네이션 상태 추가 ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 10;

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
      // 1. 전체 개수 쿼리 (페이지네이션 계산용)
      let countQuery = supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .neq('category', 'vip');

      if (activeCategory !== 'all') countQuery = countQuery.eq('category', activeCategory);
      if (searchQuery) countQuery = countQuery.ilike('title', `%${searchQuery}%`);

      const { count } = await countQuery;
      setTotalCount(count || 0);

      // 2. 실제 데이터 쿼리 (범위 지정)
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('posts')
        .select('*, author:profiles(nickname, avatar_url, level)')
        .neq('category', 'vip')
        .order(sortBy, { ascending: false })
        .range(from, to); // 🔴 페이지네이션 핵심

      if (activeCategory !== 'all') query = query.eq('category', activeCategory);
      if (searchQuery) query = query.ilike('title', `%${searchQuery}%`);

      const { data, error } = await query;
      if (error) throw error;
      setPosts(data || []);
      
      // 페이지 전환 시 상단으로 이동
      window.scrollTo(0, 0);
    } catch (err: any) {
      console.error('Community Fetch Failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialized) fetchPosts();
  }, [initialized, activeCategory, sortBy, currentPage]);

  // 카테고리나 검색어 변경 시 1페이지로 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, sortBy]);

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

  // 페이지네이션 렌더링 함수
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (!initialized) return null;

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 md:px-10 font-sans selection:bg-red-600/30">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
        
        <aside className="lg:w-72 space-y-6">
          <button 
            onClick={handleVIPAccess}
            className="w-full py-5 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-[1.5rem] border border-yellow-400/30 flex items-center justify-center gap-3 group hover:scale-[1.02] transition-all shadow-2xl"
          >
            <span className="text-xl">👑</span>
            <span className="text-black font-black italic uppercase tracking-tighter text-sm">VIP LOUNGE ACCESS</span>
          </button>

          <div className="bg-[#111] p-6 rounded-[2rem] border border-white/5 shadow-2xl">
            <nav className="space-y-1">
              {categories.map((cat) => (
                <button 
                  key={cat.id} 
                  onClick={() => setActiveCategory(cat.id)} 
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl font-bold transition-all ${
                    activeCategory === cat.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span> 
                  <span className="italic uppercase text-xs tracking-wider">{cat.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div>
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">
                {activeCategory} <span className="text-red-600">Feed</span>
              </h2>
              <p className="text-gray-600 text-[10px] font-black uppercase italic tracking-widest">Total {totalCount} Intelligence Logged</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <input 
                type="text" 
                placeholder="검색..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && fetchPosts()} 
                className="bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-red-600 transition-all w-40 md:w-56" 
              />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)} 
                className="bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-[10px] text-gray-400 font-black cursor-pointer uppercase italic outline-none"
              >
                <option value="created_at">최신순</option>
                <option value="likes">인기순</option>
                <option value="views">조회순</option>
              </select>
              <button 
                onClick={handleCreatePost} 
                className="px-6 py-2.5 bg-red-600 text-white font-black rounded-xl uppercase italic text-xs shadow-lg shadow-red-600/20 active:scale-95 transition-all"
              >
                글쓰기
              </button>
            </div>
          </header>

          <div className="space-y-4">
            {loading ? (
              <div className="py-20 text-center"><div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin inline-block"></div></div>
            ) : posts.length === 0 ? (
              <div className="py-32 text-center text-gray-700 font-black italic uppercase tracking-widest">No Intelligence Found</div>
            ) : (
              posts.map(post => (
                <Link 
                  key={post.id} 
                  to={`/post/${post.id}`} 
                  className="block bg-[#111] p-6 md:p-8 rounded-[1.8rem] border border-white/5 hover:border-red-600/30 transition-all group relative overflow-hidden"
                >
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex-1">
                      {/* 🔴 제목 크기 축소: text-xl md:text-2xl */}
                      <h3 className="text-xl md:text-2xl font-black text-white italic group-hover:text-red-500 mb-4 transition-colors leading-tight break-keep">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-4 text-[9px] text-gray-500 font-black uppercase italic tracking-widest">
                        <span className="text-red-600 bg-red-600/10 px-2 py-0.5 rounded">#{post.category}</span>
                        <span className="text-gray-300">{post.author?.nickname || 'Guest'}</span>
                        <span className="opacity-50">👁️ {post.views || 0}</span>
                        <span className="opacity-50">{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="pl-6 text-right">
                      <p className="text-red-600 font-black text-xl italic group-hover:scale-110 transition-transform">+{post.likes || 0}</p>
                    </div>
                  </div>
                  {/* 배경 장식 */}
                  <div className="absolute right-0 bottom-0 opacity-[0.02] font-black italic text-6xl pointer-events-none uppercase">FEED</div>
                </Link>
              ))
            )}
          </div>

          {/* 🔴 페이지네이션 컨트롤러 추가 */}
          {totalPages > 1 && (
            <div className="mt-16 flex justify-center items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#111] border border-white/5 text-gray-500 hover:text-white disabled:opacity-20 transition-all"
              >
                ←
              </button>
              
              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // 모바일에서는 현재 페이지 주변만 노출하도록 로직을 확장할 수 있습니다.
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-xl font-black italic text-xs transition-all ${
                        currentPage === pageNum 
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                        : 'bg-[#111] border border-white/5 text-gray-500 hover:text-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#111] border border-white/5 text-gray-500 hover:text-white disabled:opacity-20 transition-all"
              >
                →
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Community;
