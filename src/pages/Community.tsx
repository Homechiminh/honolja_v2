import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext'; 
import { useFetchGuard } from '../hooks/useFetchGuard'; 

const Community: React.FC = () => {
  const navigate = useNavigate();
  
  // 1. 전역 인증 정보 구독
  const { currentUser, loading: authLoading } = useAuth(); 
  
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

  /**
   * 🔴 [방탄 fetch] 커뮤니티 데이터 동기화
   * 에러가 발생해도 finally 블록이 로딩 스피너를 확실히 해제합니다.
   */
  const fetchPosts = async () => {
    setLoading(true); // 로딩 시작
    try {
      let query = supabase
        .from('posts')
        .select('*, author:profiles(nickname, avatar_url, level)')
        .order(sortBy, { ascending: false });

      if (activeCategory !== 'all') {
        query = query.eq('category', activeCategory);
      }
      
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        // 🔴 서버 거절(406) 등의 에러 발생 시 catch로 던짐
        throw error;
      }

      if (data) {
        setPosts(data);
      }
    } catch (err: any) {
      console.error('Community Archive Sync Failed (406 등):', err.message);
      // 에러 발생 시 리스트를 비워 잘못된 정보 노출 방지
      setPosts([]);
    } finally {
      // 🔴 핵심: 성공/실패 여부와 상관없이 무조건 로딩 상태 해제
      setLoading(false);
    }
  };

  /**
   * 🔴 [데이터 가드 적용] 
   * 인증 확인이 끝난 최적의 타이밍에 데이터를 호출하며, 필터나 정렬 변경 시 재실행됩니다.
   */
  useFetchGuard(fetchPosts, [activeCategory, sortBy]);

  const handleCreatePost = () => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    navigate('/community/create');
  };

  // 🔴 인증 정보 확인 중일 때의 블랙아웃 방지
  if (authLoading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 md:px-10 font-sans selection:bg-red-600/30">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
        
        {/* 사이드바 섹션 - 디자인 유지 */}
        <aside className="lg:w-80 space-y-6">
          <div className={`p-6 rounded-[2.5rem] border transition-all duration-500 ${
            (currentUser?.level || 0) >= 3 
            ? 'bg-yellow-600 border-yellow-500 shadow-2xl shadow-yellow-600/20' 
            : 'bg-[#111] border-white/5 opacity-80'
          }`}>
            <h3 className={`font-black italic uppercase mb-4 tracking-tighter ${
              (currentUser?.level || 0) >= 3 ? 'text-black' : 'text-yellow-600'
            }`}>
              {(currentUser?.level || 0) >= 3 ? '👑 Veteran Lounge' : '🔒 Veteran Only'}
            </h3>
            <button 
              onClick={() => navigate('/vip-lounge')} 
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase italic transition-all ${
                (currentUser?.level || 0) >= 3 
                ? 'bg-black text-yellow-500 hover:bg-zinc-900 shadow-xl' 
                : 'bg-white/5 text-gray-600 cursor-not-allowed'
              }`}
            >
              라운지 입장
            </button>
          </div>

          <div className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
            <nav className="space-y-2">
              {categories.map((cat) => (
                <button 
                  key={cat.id} 
                  onClick={() => setActiveCategory(cat.id)} 
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${
                    activeCategory === cat.id 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span> 
                  <span className="italic uppercase tracking-tighter text-sm">{cat.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* 메인 피드 섹션 - 디자인 유지 */}
        <main className="flex-1">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
              {activeCategory} <span className="text-red-600">Feed</span>
            </h2>
            
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <input 
                  type="text" 
                  placeholder="Search Title..." 
                  value={searchQuery}
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-6 py-3 text-sm text-white outline-none focus:border-red-600 transition-all font-bold italic shadow-inner placeholder:text-gray-700" 
                  onKeyDown={(e) => e.key === 'Enter' && fetchPosts()}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)} 
                className="bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-[10px] text-gray-400 font-black uppercase italic outline-none cursor-pointer hover:border-white/20 transition-all"
              >
                <option value="created_at">Latest</option>
                <option value="likes">Popular</option>
                <option value="views">Views</option>
              </select>
              <button 
                onClick={handleCreatePost} 
                className="px-8 py-3 bg-red-600 text-white font-black rounded-xl uppercase italic shadow-xl shadow-red-600/20 hover:bg-red-700 active:scale-95 transition-all text-sm"
              >
                글쓰기
              </button>
            </div>
          </header>

          <div className="space-y-6">
            {loading ? (
              <div className="py-20 text-center">
                <div className="inline-block w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 font-black italic uppercase tracking-[0.2em] text-xs">Syncing Database...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="py-32 text-center bg-[#0a0a0a] rounded-[3.5rem] border border-dashed border-white/5 animate-in fade-in duration-500">
                <p className="text-gray-700 font-black italic uppercase tracking-widest text-xl">No Intelligence Data Found</p>
              </div>
            ) : (
              posts.map(post => (
                <Link 
                  key={post.id} 
                  to={`/post/${post.id}`} 
                  className="block bg-[#111] p-8 md:p-10 rounded-[2.5rem] border border-white/5 hover:border-red-600/50 transition-all group shadow-2xl hover:-translate-y-1 duration-300 animate-in fade-in slide-in-from-bottom-2"
                >
                  <div className="flex justify-between items-start gap-6">
                    <div className="flex-1">
                      <h3 className="text-2xl md:text-3xl font-black text-white italic group-hover:text-red-500 mb-6 transition-colors leading-tight tracking-tight break-keep">
                        {post.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-5 text-[10px] text-gray-500 font-black uppercase tracking-[0.15em] italic">
                        <span className="text-red-600 bg-red-600/5 px-3 py-1 rounded-full border border-red-600/10">#{post.category}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-red-600 text-[8px] border border-white/10 font-black">
                            LV.{post.author?.level || 1}
                          </div>
                          <span className="text-gray-300">{post.author?.nickname || 'Guest User'}</span>
                        </div>
                        <span className="opacity-20 text-white">|</span>
                        <span>👁️ {post.views || 0}</span>
                        <span>🕒 {new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="shrink-0 text-center bg-black/40 px-8 py-5 rounded-[2rem] border border-white/5 min-w-[110px] shadow-inner group-hover:border-red-600/20 transition-all">
                      <p className="text-[8px] text-gray-600 font-black uppercase mb-1 italic tracking-widest">Post Score</p>
                      <p className="text-red-600 font-black text-3xl italic leading-none">+{post.likes || 0}</p>
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
