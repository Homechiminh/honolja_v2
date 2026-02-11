import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext'; 
// [추가] 만들어두신 MillMap 컴포넌트를 임포트합니다.
import MillMap from './MillMap'; 

const Community: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, initialized } = useAuth(); 
  
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'likes' | 'views'>('created_at');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 10;

  // [추가] 지도에 표시할 업소 데이터를 위한 상태
  const [allStores, setAllStores] = useState<any[]>([]);

  const categories = [
    { id: 'all', name: '전체피드', icon: '🌍' },
    { id: 'free', name: '자유게시판', icon: '💬' },
    { id: 'review', name: '업소후기', icon: '📸' },
    { id: 'qna', name: '질문/답변', icon: '🙋' },
    { id: 'food', name: '맛집/관광', icon: '🍜' },
    { id: 'business', name: '부동산/비즈니스', icon: '🏢' },
  ];

  const getCategoryName = (id: string) => {
    return categories.find(c => c.id === id)?.name || '커뮤니티';
  };

  // [추가] 지도에 뿌려줄 업소 리스트를 가져오는 함수
  const fetchAllStores = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*');
      if (error) throw error;
      setAllStores(data || []);
    } catch (err: any) {
      console.error('Map Data Fetch Failed:', err.message);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let countQuery = supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .neq('category', 'vip');

      if (activeCategory !== 'all') countQuery = countQuery.eq('category', activeCategory);
      if (searchQuery) countQuery = countQuery.ilike('title', `%${searchQuery}%`);

      const { count } = await countQuery;
      setTotalCount(count || 0);

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('posts')
        .select('*, author:profiles(nickname, avatar_url, level)')
        .neq('category', 'vip')
        .order(sortBy, { ascending: false })
        .range(from, to); 

      if (activeCategory !== 'all') query = query.eq('category', activeCategory);
      if (searchQuery) query = query.ilike('title', `%${searchQuery}%`);

      const { data, error } = await query;
      if (error) throw error;
      setPosts(data || []);
      
      window.scrollTo(0, 0);
    } catch (err: any) {
      console.error('Community Fetch Failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialized) {
      fetchPosts();
      fetchAllStores(); // 페이지 로드 시 업소 데이터도 함께 호출
    }
  }, [initialized, activeCategory, sortBy, currentPage]);

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

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (!initialized) return null;

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 md:px-10 font-sans selection:bg-red-600/30">
      <Helmet>
        <title>호놀자 커뮤니티 | {getCategoryName(activeCategory)} - 호치민 유흥 · 밤문화 · 여행 리얼 후기</title>
        <meta name="description" content={`베트남 호치민 여행의 생생한 현장! ${getCategoryName(activeCategory)} 채널에서 마사지, 가라오케, 맛집, 밤문화 정보를 공유하세요.`} />
        <meta property="og:title" content={`호놀자 커뮤니티 - ${getCategoryName(activeCategory)}`} />
      </Helmet>

      <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row gap-10">
        
        {/* 메뉴 사이드바 */}
        <aside className="lg:w-72 space-y-6">
          <button 
            onClick={handleVIPAccess}
            className="w-full py-5 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-[1.5rem] border border-yellow-400/30 flex items-center justify-center gap-3 group hover:scale-[1.02] transition-all shadow-2xl"
          >
            <span className="text-xl">👑</span>
            <span className="text-black font-black italic uppercase tracking-tighter text-sm">VIP 라운지 이동</span>
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

        {/* 메인 게시글 영역 */}
        <main className="flex-1">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div>
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">
                {getCategoryName(activeCategory)} <span className="text-red-600">피드</span>
              </h2>
              <p className="text-gray-600 text-[11px] font-bold uppercase italic tracking-widest">전체 게시글 {totalCount}개</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <input 
                type="text" 
                placeholder="검색어 입력..." 
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

          {/* 게시글 리스트 */}
          <div className="space-y-4">
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin inline-block"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="py-32 text-center text-gray-700 font-black italic uppercase tracking-widest border border-dashed border-white/5 rounded-3xl">
                등록된 게시글이 없습니다.
              </div>
            ) : (
              posts.map(post => (
                <Link 
                  key={post.id} 
                  to={`/post/${post.id}`} 
                  className="block bg-[#111] p-6 md:p-8 rounded-[1.8rem] border border-white/5 hover:border-red-600/30 transition-all group relative overflow-hidden shadow-lg"
                >
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-black text-white italic group-hover:text-red-500 mb-4 transition-colors leading-tight break-keep">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-4 text-[9px] text-gray-500 font-black uppercase italic tracking-widest">
                        <span className="text-red-600 bg-red-600/10 px-2 py-0.5 rounded">#{getCategoryName(post.category)}</span>
                        <span className="text-gray-300">{post.author?.nickname || '익명'}</span>
                        <span className="opacity-50">👁️ {post.views || 0}</span>
                        <span className="opacity-50">{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="pl-6 text-right">
                      <p className="text-red-600 font-black text-xl italic group-hover:scale-110 transition-transform">+{post.likes || 0}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* 페이지네이션 생략 (기존과 동일하게 유지됨) */}

          {/* 📍 [수정된 지도 섹션] MillMap 컴포넌트 적용 */}
          <section className="mt-24">
            <div className="flex items-center gap-3 mb-8">
              <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">호치민 방앗간 <span className="text-red-600">MAP</span></h3>
            </div>
            
            <div className="relative w-full aspect-video md:aspect-[21/9] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-[#111]">
              {/* [중요] MillMap 컴포넌트에 불러온 업소 데이터를 전달합니다. */}
              <MillMap stores={allStores} />
              
              {/* 테두리 디자인 효과 */}
              <div className="absolute inset-0 pointer-events-none border-[12px] border-[#050505] rounded-[2.5rem]"></div>
            </div>
            
            <p className="text-center mt-6 text-gray-500 text-[10px] font-bold italic uppercase tracking-[0.2em]">Ho Chi Minh Premium Guide Map © Honolja</p>
          </section>

        </main>
      </div>
    </div>
  );
};

export default Community;
