import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import type { User } from '../types';

const PostDetail: React.FC<{ currentUser: User | null }> = ({ currentUser }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);

  useEffect(() => {
    fetchPostData();
    // 조회수 1 증가 로직 (옵션)
    if (id) supabase.rpc('increment_views', { post_id: id });
  }, [id]);

  const fetchPostData = async () => {
    if (!id) return;
    setLoading(true);
    
    // 1. 게시글 상세 정보 가져오기 (작성자 프로필 및 업소 정보 포함)
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(nickname, avatar_url, level),
        store:stores(id, name)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      alert('게시글을 찾을 수 없습니다.');
      return navigate('/community');
    }

    // 🔴 2. 베테랑 전용 접근 권한 체크
    if (data.category === 'vip' && (!currentUser || currentUser.level < 3)) {
      setShowLevelModal(true);
    }

    setPost(data);

    // 3. 댓글 목록 가져오기
    const { data: commentData } = await supabase
      .from('comments')
      .select('*, author:profiles(nickname, avatar_url, level)')
      .eq('post_id', id)
      .order('created_at', { ascending: true });
    
    if (commentData) setComments(commentData);
    setLoading(false);
  };

  // 🔴 댓글 작성 및 5P 적립 엔진
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return alert('로그인 후 댓글을 작성할 수 있습니다.');
    if (!newComment.trim()) return;

    setCommenting(true);
    try {
      // (1) 댓글 저장
      const { error: commError } = await supabase
        .from('comments')
        .insert([{ post_id: id, author_id: currentUser.id, content: newComment }]);
      if (commError) throw commError;

      // (2) 5P 적립 및 가계부 기록
      const { error: pointError } = await supabase
        .from('profiles')
        .update({ points: (currentUser.points || 0) + 5 })
        .eq('id', currentUser.id);
      if (pointError) throw pointError;

      await supabase.from('point_history').insert([{
        user_id: currentUser.id,
        amount: 5,
        reason: '댓글 작성 보상'
      }]);

      setNewComment('');
      fetchPostData(); // 리프레시
      alert('댓글이 등록되었습니다! (+5P 적립)');
    } catch (err) {
      alert('댓글 등록 중 오류가 발생했습니다.');
    } finally {
      setCommenting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white italic animate-pulse">LOADING DATA...</div>;

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4">
      {/* 권한 부족 모달 */}
      {showLevelModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-yellow-600/40 p-10 rounded-[2.5rem] max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-2xl font-black text-white italic mb-2 uppercase">VETERAN ONLY</h3>
            <p className="text-gray-400 text-sm font-medium mb-8">베테랑(Lv.3) 회원만 볼 수 있는 비밀 정보입니다. 후기를 작성하고 등급을 올려주세요!</p>
            <button onClick={() => navigate(-1)} className="w-full py-4 bg-yellow-600 text-black rounded-2xl font-black uppercase hover:bg-yellow-500 transition-all">목록으로 돌아가기</button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-8">
        {/* 게시글 헤더 */}
        <div className={`bg-[#0f0f0f] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl ${post.category === 'vip' ? 'border-yellow-600/30' : ''}`}>
          <header className={`p-10 md:p-16 border-b border-white/5 bg-gradient-to-b ${post.category === 'vip' ? 'from-yellow-600/10' : 'from-red-600/10'} to-transparent`}>
            <div className="flex items-center gap-4 mb-8">
              <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase italic tracking-widest ${post.category === 'vip' ? 'bg-yellow-600' : 'bg-red-600'}`}>
                {post.category}
              </span>
              <span className="text-gray-500 text-xs font-bold uppercase italic">Intel Shared by {post.author?.nickname}</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black text-white mb-10 italic tracking-tighter leading-tight">{post.title}</h1>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-10 border-t border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                  <img src={post.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.nickname}`} className="w-full h-full object-cover" alt="avatar" />
                </div>
                <div>
                  <p className="text-white font-black text-lg">{post.author?.nickname}</p>
                  <p className="text-yellow-500 text-[10px] font-black uppercase">Level {post.author?.level} Member</p>
                </div>
              </div>
              <div className="text-right text-[10px] text-gray-500 font-black uppercase space-y-1 italic">
                <p>Posted: {new Date(post.created_at).toLocaleDateString()}</p>
                <p>Views: {post.views || 0} • Recommendation: {post.likes || 0}</p>
              </div>
            </div>
          </header>

          {/* 🔴 업소 정보 카드 (리뷰일 때만 노출) */}
          {post.store && (
            <div className="px-10 md:px-16 py-6 border-b border-white/5 bg-emerald-600/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl">🏢</span>
                <div>
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Target Store</p>
                  <p className="text-white font-black text-xl italic">{post.store.name}</p>
                </div>
              </div>
              <Link to={`/store/${post.store.id}`} className="px-6 py-2 bg-emerald-600 text-white text-[10px] font-black rounded-xl uppercase italic hover:bg-white hover:text-emerald-600 transition-all">Store Info</Link>
            </div>
          )}

          {/* 본문 내용 */}
          <article className="p-10 md:p-16 text-gray-300 text-xl leading-relaxed whitespace-pre-wrap font-medium">
            {post.content}
            {post.image_urls?.map((url: string, i: number) => (
              <img key={i} src={url} className="w-full rounded-[2.5rem] mt-10 border border-white/10 shadow-2xl" alt="content" />
            ))}
          </article>
        </div>

        {/* 댓글 섹션 */}
        <div className="bg-[#0f0f0f] rounded-[3rem] border border-white/5 p-10 md:p-16 shadow-2xl">
          <h3 className="text-2xl font-black text-white italic mb-10 uppercase tracking-widest flex items-center gap-3">
            <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span> Comments ({comments.length})
          </h3>

          <div className="space-y-8 mb-12">
            {comments.map((comm) => (
              <div key={comm.id} className="flex gap-6 items-start group">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex-shrink-0 overflow-hidden border border-white/5">
                  <img src={comm.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comm.author?.nickname}`} className="w-full h-full object-cover" alt="comm_avatar" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-black text-sm">{comm.author?.nickname}</span>
                    <span className="text-yellow-600 text-[9px] font-black uppercase">Lv.{comm.author?.level}</span>
                    <span className="text-[10px] text-gray-600 font-bold ml-auto">{new Date(comm.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-400 text-lg font-medium leading-relaxed">{comm.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 댓글 입력 폼 */}
          <form onSubmit={handleCommentSubmit} className="relative mt-16 group">
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="따뜻한 댓글로 소통해보세요! (+5P 적립)"
              className="w-full bg-black border border-white/10 rounded-[2rem] px-8 py-6 text-white outline-none focus:border-red-600 transition-all resize-none min-h-[120px]"
            />
            <button 
              type="submit" 
              disabled={commenting || !newComment.trim()}
              className="absolute bottom-4 right-4 bg-red-600 text-white px-8 py-3 rounded-xl font-black uppercase italic text-xs hover:bg-white hover:text-red-600 transition-all disabled:opacity-50"
            >
              {commenting ? '...' : 'Post & Get 5P'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
