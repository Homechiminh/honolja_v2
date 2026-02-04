import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; // 🔴 추가
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext'; 
import { useFetchGuard } from '../hooks/useFetchGuard'; 

const VipLounge: React.FC = () => {
  const navigate = useNavigate();
  const { initialized } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubMenu, setActiveSubMenu] = useState('전체피드');

  const subMenus = [
    { id: '전체피드', icon: '🌍' }, 
    { id: '시크릿 꿀정보', icon: '💎' },
    { id: '업소후기', icon: '📸' },
    { id: '실시간 현황', icon: '📡' },
    { id: '블랙리스트', icon: '🚫' },
  ];

  const fetchVipPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select('*, author:profiles(nickname, level)')
        .eq('category', 'vip')
        .order('created_at', { ascending: false });

      if (activeSubMenu !== '전체피드') {
        query = query.eq('sub_category', activeSubMenu);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPosts(data || []);
    } catch (err: any) {
      console.error("VIP Lounge Fetch Failed:", err.message);
      setPosts([]); 
    } finally {
      setLoading(false);
    }
  };

  useFetchGuard(fetchVipPosts, [activeSubMenu]);

  if (!initialized) return null;

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans">
      {/* 🔴 SEO 최적화 Helmet 섹션 */}
      <Helmet>
        <title>호놀자 VIP 라운지 | {activeSubMenu} - 호치민 유흥 & 밤문화 시크릿 정보</title>
        <meta name="description" content={`호놀자 베테랑 회원 전용 VIP 라운지. ${activeSubMenu} 카테고리의 호치민 가라오케, 마사지, 밤문화 시크릿 꿀정보와 실시간 현황, 블랙리스트를 확인하세요.`} />
        <meta name="keywords" content="호치민여행, 호치민 유흥, 호치민 밤문화, 베트남여행, 베트남 여자, 호치민 가라오케, 호치민 마사지, 호치민 불건, 호치민 VIP정보" />
        <meta property="og:title" content={`호놀자 VIP 라운지 - ${activeSubMenu}`} />
        <meta property="og:description" content="호치민 밤문화의 정점, 베테랑 회원들만 아는 시크릿 정보를 공유합니다." />
      </Helmet>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
        <aside className="lg:w-80">
          <div className="bg-[#0f0f0f] border border-yellow-600/10 rounded-[3rem] p-10 space-y-4 shadow-2xl">
            <button onClick={() => navigate('/community')} className="w-full mb-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-gray-400 font-black text-xs uppercase italic">← 일반 게시판으로</button>
            {subMenus.map(menu => (
              <button key={menu.id} onClick={() => setActiveSubMenu(menu.id)} className={`w-full flex items-center gap-4 px-8 py-5 rounded-[1.5rem] font-black transition-all border-2 ${activeSubMenu === menu.id ? 'bg-yellow-600 border-yellow-500 text-black' : 'bg-transparent border-white/5 text-gray-500'}`}>
                <span>{menu.icon}</span>
                <span className="italic uppercase tracking-tighter text-sm">{menu.id}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
              <span className="text-yellow-500">👑</span> {activeSubMenu}
            </h2>
            <button onClick={() => navigate('/community/create')} className="px-10 py-5 bg-white text-black font-black rounded-2xl italic hover:bg-yellow-500 transition-all uppercase text-xs">기밀 제보하기</button>
          </header>

          <div className="bg-[#0f0f0f] rounded-[3.5rem] border border-yellow-600/10 overflow-hidden divide-y divide-white/5 shadow-2xl">
            {loading ? <div className="p-20 text-center"><div className="w-10 h-10 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div> :
              posts.length > 0 ? posts.map(post => (
                <Link key={post.id} to={`/post/${post.id}`} className="group p-12 hover:bg-yellow-600/5 block transition-all">
                  <h3 className="text-2xl md:text-3xl font-black text-white italic group-hover:text-yellow-500 mb-4 tracking-tight">{post.title}</h3>
                  <div className="flex items-center gap-6 text-[10px] text-gray-500 font-black italic uppercase">
                    <span className="text-yellow-600">Verified by {post.author?.nickname}</span>
                    <span className="text-white/30 ml-2">#{post.sub_category}</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </Link>
              )) : (
                <div className="py-48 text-center opacity-20 flex flex-col items-center">
                  <p className="text-gray-700 font-black uppercase tracking-widest text-2xl">No Restricted Data</p>
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default VipLounge;
