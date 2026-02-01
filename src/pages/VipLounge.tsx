import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext'; 
import { useFetchGuard } from '../hooks/useFetchGuard'; 

const VipLounge: React.FC = () => {
  const navigate = useNavigate();
  
  // 1. 전역 인증 상태 구독
  const { loading: authLoading } = useAuth();

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  
  const [activeSubMenu, setActiveSubMenu] = useState('시크릿 꿀정보');
  const subMenus = [
    { id: '시크릿 꿀정보', icon: '💎' },
    { id: '업소후기', icon: '📸' },
    { id: '실시간 현황', icon: '📡' },
    { id: '블랙리스트', icon: '🚫' },
  ];

  const activeIcon = subMenus.find(m => m.id === activeSubMenu)?.icon || '👑';

  /**
   * 🔴 [방탄 fetch] 데이터 호출 로직
   * try-catch-finally 구조를 통해 에러 발생 시에도 로딩을 강제 해제합니다.
   */
  const fetchVipPosts = async () => {
    setFetching(true); // 탭 전환 시 오버레이 활성화
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*, author:profiles(nickname, level)')
        .eq('category', 'vip')
        .eq('sub_category', activeSubMenu)
        .order('created_at', { ascending: false });

      if (error) {
        // 🔴 서버 응답 에러(406 등) 발생 시 catch 블록으로 던짐
        throw error;
      }

      if (data) {
        setPosts(data);
      }
    } catch (err: any) {
      console.error("VIP 데이터 로드 실패 (406 또는 인증 에러):", err.message);
      // 에러 시 기존 포스트를 비워주어 잘못된 데이터 노출 방지
      setPosts([]); 
    } finally {
      // 🔴 핵심: 성공하든 실패하든 무조건 로딩 상태 해제
      setLoading(false);
      setFetching(false);
    }
  };

  // 2. [데이터 가드 적용] 
  // 인증 완료 후 실행 및 카테고리(activeSubMenu) 변경 시 재호출
  useFetchGuard(fetchVipPosts, [activeSubMenu]);

  // 3. 전체 로딩 가드 (인증 대기 + 초기 데이터 로드 대기)
  if (authLoading || (loading && posts.length === 0)) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
        {/* 사이드바 디자인 유지 */}
        <aside className="lg:w-80">
          <div className="sticky top-28 bg-[#0f0f0f] border border-yellow-600/10 rounded-[3rem] p-10 space-y-4 shadow-2xl">
            <button onClick={() => navigate('/community')} className="w-full mb-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-gray-400 font-black text-xs uppercase italic hover:text-white transition-all flex items-center justify-center gap-2">
              ← 일반 게시판으로
            </button>
            {subMenus.map(menu => (
              <button 
                key={menu.id} 
                onClick={() => setActiveSubMenu(menu.id)} 
                className={`w-full flex items-center justify-between px-8 py-5 rounded-[1.5rem] font-black transition-all border-2 ${
                  activeSubMenu === menu.id ? 'bg-yellow-600 border-yellow-500 text-black shadow-[0_0_20px_rgba(202,138,4,0.3)]' : 'bg-transparent border-white/5 text-gray-500 hover:border-yellow-600/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span>{menu.icon}</span>
                  <span className="italic uppercase tracking-tighter text-sm">{menu.id}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* 메인 리스트 디자인 유지 */}
        <main className="flex-1">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
                <span className="text-yellow-500">{activeIcon}</span> {activeSubMenu}
              </h2>
              <p className="text-gray-600 font-bold text-[10px] mt-4 italic uppercase ml-14 tracking-widest">Private Member Access Only</p>
            </div>
            <button 
              onClick={() => navigate('/community/create')} 
              className="px-10 py-5 bg-white text-black font-black rounded-2xl italic hover:bg-yellow-500 transition-all shadow-xl uppercase text-xs active:scale-95"
            >
              기밀 제보하기
            </button>
          </header>

          {/* fetching 중일 때 투명도 조절로 로딩 체감 제공 */}
          <div className={`transition-opacity duration-300 ${fetching ? 'opacity-30' : 'opacity-100'}`}>
            <div className="bg-[#0f0f0f] rounded-[3.5rem] border border-yellow-600/10 overflow-hidden divide-y divide-white/5 shadow-2xl">
              {posts.length > 0 ? posts.map(post => (
                <Link key={post.id} to={`/post/${post.id}`} className="group p-12 hover:bg-yellow-600/5 block transition-all">
                  <h3 className="text-2xl md:text-3xl font-black text-white italic group-hover:text-yellow-500 mb-4 tracking-tight leading-tight break-keep">{post.title}</h3>
                  <div className="flex items-center gap-6 text-[10px] text-gray-500 font-black italic uppercase tracking-widest">
                    <span>👁️ {post.views || 0} VIEWS</span>
                    <span className="text-yellow-600">Verified by {post.author?.nickname} Lv.{post.author?.level}</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </Link>
              )) : (
                <div className="py-48 text-center opacity-20 flex flex-col items-center">
                  <span className="text-6xl mb-4">💎</span>
                  <p className="text-gray-700 font-black uppercase tracking-widest text-2xl">No Restricted Data Records</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VipLounge;
