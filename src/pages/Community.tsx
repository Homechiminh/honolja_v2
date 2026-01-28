import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import type { User } from '../types';

const Community: React.FC<{ currentUser: User | null }> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
    fetchPosts();
  }, [activeCategory]);

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase
      .from('posts')
      .select('*, author:profiles(nickname, avatar_url, level)')
      .order('created_at', { ascending: false });

    if (activeCategory !== 'all') {
      query = query.eq('category', activeCategory);
    }

    const { data } = await query;
    if (data) setPosts(data);
    setLoading(false);
  };

  // 🔴 글쓰기 버튼 클릭 시 로그인 체크
  const handleCreatePost = () => {
    if (!currentUser) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }
    navigate('/community/create');
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 md:px-10">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
        
        {/* 좌측 사이드바 */}
        <aside className="lg:w-80 space-y-6">
          {/* 🔴 currentUser를 사용하여 베테랑 구역 UI 제어 */}
          <div className={`p-6 rounded-[2.5rem] border ${currentUser?.level && currentUser.level >= 3 ? 'bg-yellow-600 border-yellow-500' : 'bg-[#111] border-white/5 opacity-80'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`font-black italic uppercase ${currentUser?.level && currentUser.level >= 3 ? 'text-black' : 'text-yellow-600'}`}>
                {currentUser?.level && currentUser.level >= 3 ? '👑 Veteran Lounge' : '🔒 Veteran Only'}
              </h3>
            </div>
            <p className={`text-[10px] font-bold mb-6 ${currentUser?.level && currentUser.level >= 3 ? 'text-black/60' : 'text-gray-500'}`}>
              {currentUser?.level && currentUser.level >= 3 
                ? '베테랑 전용 기밀 정보를 확인하세요.' 
                : '베테랑(Lv.3) 등급만 입장 가능합니다.'}
            </p>
            <button 
              onClick={() => navigate('/vip-lounge')} 
              className={`w-full py-4 rounded-2xl font-black text-xs transition-all ${
                currentUser?.level && currentUser.level >= 3 
                ? 'bg-black text-yellow-500 hover:scale-105' 
                : 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed'
              }`}
            >
              베테랑 라운지 입장
            </button>
          </div>

          <div className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5">
            <nav className="space-y-2">
              {categories.map((cat) => (
                <button 
                  key={cat.id} 
                  onClick={() => setActiveCategory(cat.id)} 
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${
                    activeCategory === cat.id ? 'bg-red-600 text-white shadow-xl' : 'text-gray-500 hover:bg-white/5'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="italic uppercase tracking-tighter">{cat.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* 메인 피드 */}
        <main className="flex-1">
          <header className="flex justify-between items-center mb-10">
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">
              {categories.find(c => c.id === activeCategory)?.name} <span className="text-red-600 font-black">Feed</span>
            </h2>
            <button 
              onClick={handleCreatePost} 
              className="px-8 py-4 bg-red-600 text-white font-black rounded-2xl uppercase italic hover:bg-red-700 transition-all shadow-2xl"
            >
              글쓰기
            </button>
          </header>

          <div className="space-y-4">
            {loading ? (
              <div className="py-20 text-center text-gray-600 italic animate-pulse font-black">LOADING FEED...</div>
            ) : posts.length > 0 ? (
              posts.map(post => (
                <Link 
                  key={post.id} 
                  to={`/post/${post.id}`} 
                  className="block bg-[#111] p-8 rounded-[2.5rem] border border-white/5 hover:border-red-600/50 transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-black text-white italic group-hover:text-red-500 transition-colors mb-4">{post.title}</h3>
                      <div className="flex items-center gap-4 text-[10px] text-gray-600 font-black uppercase italic">
                        <span className="text-red-600">#{post.category}</span>
                        <span className="flex items-center gap-1">
                          <img src={post.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.nickname}`} className="w-4 h-4 rounded" alt="avt" />
                          {post.author?.nickname}
                        </span>
                        <span>LV.{post.author?.level}</span>
                        <span>👁️ {post.views || 0}</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-center bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                      <p className="text-[8px] text-gray-600 font-black uppercase italic">Points</p>
                      <p className="text-red-600 font-black italic">+{post.likes || 0}</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-40 bg-[#111] rounded-[3rem] border border-white/5 text-center">
                <p className="text-gray-600 font-black text-2xl italic uppercase opacity-20 tracking-widest">No Posts Found</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Community;
