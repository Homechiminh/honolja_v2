import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext'; 
import { useFetchGuard } from '../hooks/useFetchGuard'; 

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, initialized } = useAuth(); 

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const fetchPostData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data: postData, error: postErr } = await supabase.from('posts').select('*, author:profiles(*)').eq('id', id).single();
      if (postErr || !postData) throw postErr || new Error("Post not found");
      setPost(postData);

      const { data: comms, error: commErr } = await supabase.from('comments').select('*, author:profiles(*)').eq('post_id', id).order('created_at', { ascending: true });
      if (commErr) throw commErr;
      if (comms) setComments(comms);

      // 조회수 증가
      await supabase.rpc('increment_views', { post_id: id });
    } catch (err: any) {
      if (err.message?.includes("Post not found")) {
         alert('삭제되었거나 존재하지 않는 게시글입니다.');
         navigate('/community');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useFetchGuard(fetchPostData, [id]);

  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!currentUser || !id) return;
      try {
        const { data } = await supabase.from('post_likes').select('*').eq('post_id', id).eq('user_id', currentUser.id).single();
        if (data) setIsLiked(true);
      } catch (e) {}
    };
    if (initialized && currentUser) checkLikeStatus();
  }, [id, currentUser, initialized]);

  const handleLike = async () => {
    if (!currentUser) return alert('로그인이 필요합니다.');
    if (isLiked) return alert('이미 추천한 게시글입니다.');
    try {
      await supabase.from('post_likes').insert([{ post_id: id, user_id: currentUser.id }]);
      await supabase.from('posts').update({ likes: (post.likes || 0) + 1 }).eq('id', id);
      setIsLiked(true);
      fetchPostData(); 
    } catch (e) {
      alert('추천 처리 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) return;
    try {
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (error) throw error;
      alert('댓글이 삭제되었습니다.');
      fetchPostData(); 
    } catch (err: any) {
      alert(`삭제 실패: ${err.message}`);
    }
  };

  const checkPointEligibility = async (contentStr: string) => {
    if (!currentUser || !post) return false;
    if (currentUser.id === post.author_id) return false;
    if (contentStr.trim().length < 10) return false;
    const today = new Date().toISOString().split('T')[0];
    const { count } = await supabase.from('point_history').select('*', { count: 'exact', head: true }).eq('user_id', currentUser.id).eq('reason', '댓글 작성 보상').gte('created_at', today);
    if (count && count >= 5) return false;
    return true;
  };

  const handleCommentSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    if (!currentUser) return alert('로그인이 필요합니다.');
    if (!newComment.trim()) return;

    setCommenting(true);
    try {
      const { error: commErr } = await supabase.from('comments').insert([{ 
        post_id: id, author_id: currentUser.id, content: newComment, parent_id: parentId
      }]);
      if (commErr) throw commErr;

      const isEligible = await checkPointEligibility(newComment);
      if (isEligible) {
        const reward = 5;
        await supabase.from('profiles').update({ points: (currentUser.points || 0) + reward }).eq('id', currentUser.id);
        await supabase.from('point_history').insert([{ user_id: currentUser.id, amount: reward, reason: '댓글 작성 보상' }]);
      }

      setNewComment('');
      setReplyToId(null);
      fetchPostData(); 
    } catch (err: any) {
      alert(`댓글 등록 실패: ${err.message}`);
    } finally {
      setCommenting(false);
    }
  };

  const commentTree = comments.filter(c => !c.parent_id).map(parent => ({
    ...parent,
    replies: comments.filter(child => child.parent_id === parent.id)
  }));

  if (!initialized || loading || !post) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white font-black italic animate-pulse uppercase tracking-widest">데이터를 분석 중...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 font-sans selection:bg-red-600/30 text-white">
      <Helmet>
        <title>호놀자 | {post.title}</title>
      </Helmet>

      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* 게시글 본문 */}
        <div className="bg-[#0f0f0f] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
          <header className="p-10 md:p-16 border-b border-white/5">
            <div className="flex justify-between items-start mb-10">
              <span className="px-4 py-1 bg-red-600 text-white text-[10px] font-black rounded-full uppercase italic tracking-widest shadow-lg shadow-red-900/20">
                #{post.category.toUpperCase()}
              </span>
              {(currentUser?.id === post.author_id || currentUser?.role === 'ADMIN') && (
                <Link to={`/post/edit/${post.id}`} className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-500 hover:text-white hover:border-red-600 font-black text-[10px] uppercase italic transition-all">Edit Post</Link>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white mb-10 italic tracking-tighter leading-tight break-keep">{post.title}</h1>

            <div className="flex justify-between items-center pt-8 border-t border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 overflow-hidden shadow-xl">
                  <img src={post.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.nickname}`} alt="avatar" />
                </div>
                <div>
                  <p className="text-white font-black italic text-lg leading-tight">{post.author?.nickname}</p>
                  <p className="text-yellow-500 text-[10px] font-black uppercase tracking-widest mt-1">Lv.{post.author?.level} MEMBER</p>
                </div>
              </div>
              <button onClick={handleLike} className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${isLiked ? 'text-red-500 scale-110' : 'text-gray-500 hover:text-red-500'}`}>
                <span className="text-2xl">{isLiked ? '❤️' : '🤍'}</span>
                <span className="text-[9px] font-black uppercase italic tracking-tighter">추천 {post.likes || 0}</span>
              </button>
            </div>
          </header>

          <article className="p-10 md:p-16 text-slate-200 text-lg md:text-xl leading-[1.8] whitespace-pre-wrap font-medium italic">
            {post.image_urls?.map((url: string, i: number) => (
              <img key={i} src={url} alt="첨부이미지" className="w-full rounded-[2rem] mb-10 border border-white/5 shadow-2xl" />
            ))}
            {post.content}
          </article>
        </div>

        {/* 댓글 섹션 */}
        <div className="bg-[#0f0f0f] rounded-[3rem] p-10 md:p-16 shadow-2xl border border-white/5">
          <h3 className="text-2xl font-black text-white italic mb-12 uppercase tracking-widest flex items-center gap-4">
            <span className="w-2 h-8 bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.4)]"></span> 
            댓글 <span className="text-red-600">({comments.length})</span>
          </h3>
          
          <div className="space-y-12 mb-16">
            {commentTree.map((comm) => (
              <div key={comm.id} className="space-y-6">
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0">
                    <img src={comm.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comm.author?.nickname}`} alt="avatar" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-black text-xs italic uppercase">
                        {comm.author?.nickname} <span className="text-yellow-600 ml-2">LV.{comm.author?.level}</span>
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-[9px] text-gray-600 font-bold italic">{new Date(comm.created_at).toLocaleString()}</span>
                        <button onClick={() => setReplyToId(comm.id)} className="text-[10px] font-black text-red-600 uppercase italic">답글</button>
                        {(currentUser?.id === comm.author_id || currentUser?.role === 'ADMIN') && (
                          <button onClick={() => handleDeleteComment(comm.id)} className="text-[10px] font-black text-gray-600 uppercase hover:text-red-600 transition-colors italic">삭제</button>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-300 text-base md:text-lg leading-relaxed italic">{comm.content}</p>
                  </div>
                </div>

                {/* 대댓글 영역 */}
                <div className="ml-16 space-y-8 border-l-2 border-white/5 pl-8">
                  {comm.replies.map((reply: any) => (
                    <div key={reply.id} className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden shrink-0">
                        <img src={reply.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.author?.nickname}`} alt="avatar" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 font-black text-[11px] italic uppercase">
                            {reply.author?.nickname} <span className="text-yellow-600 ml-1">LV.{reply.author?.level}</span>
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-[8px] text-gray-700 font-bold italic">{new Date(reply.created_at).toLocaleString()}</span>
                            {(currentUser?.id === reply.author_id || currentUser?.role === 'ADMIN') && (
                              <button onClick={() => handleDeleteComment(reply.id)} className="text-[8px] font-black text-gray-700 uppercase hover:text-red-600 transition-colors italic">삭제</button>
                            )}
                          </div>
                        </div>
                        <p className="text-slate-400 text-base leading-relaxed italic">{reply.content}</p>
                      </div>
                    </div>
                  ))}

                  {/* 대댓글 입력창 */}
                  {replyToId === comm.id && (
                    <div className="mt-4 animate-in slide-in-from-top-2">
                      <textarea 
                        value={newComment} 
                        onChange={(e) => setNewComment(e.target.value)} 
                        placeholder="답글 내용을 입력하세요..." 
                        className="w-full bg-[#050505] border-2 border-red-600/30 rounded-2xl px-6 py-5 text-white text-sm outline-none focus:border-red-600 transition-all italic font-bold placeholder:text-gray-800"
                      />
                      <div className="flex justify-end gap-3 mt-3">
                        <button onClick={() => {setReplyToId(null); setNewComment('');}} className="px-5 py-2 text-[10px] font-black text-gray-600 uppercase italic">취소</button>
                        <button onClick={(e) => handleCommentSubmit(e, comm.id)} className="bg-red-600 text-white px-8 py-2.5 rounded-xl font-black uppercase text-[10px] italic shadow-xl">답글 등록</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 메인 댓글 입력창 (🔴 가시성 대폭 강화) */}
          {!replyToId && (
            <form onSubmit={(e) => handleCommentSubmit(e, null)} className="relative mt-20">
              <div className="relative group">
                <textarea 
                  value={newComment} 
                  onChange={(e) => setNewComment(e.target.value)} 
                  placeholder={currentUser ? "여기에 댓글을 입력하세요..." : "로그인이 필요한 구역입니다."} 
                  disabled={!currentUser} 
                  className="w-full bg-[#050505] border-2 border-white/10 rounded-[2.5rem] px-8 py-8 text-white text-lg outline-none focus:border-red-600 focus:bg-black transition-all resize-none italic font-bold shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)] placeholder:text-gray-700 min-h-[180px]" 
                />
                <button 
                  type="submit" 
                  disabled={commenting || !currentUser || !newComment.trim()} 
                  className="absolute bottom-6 right-8 bg-red-600 text-white px-12 py-5 rounded-2xl font-black uppercase text-sm hover:bg-white hover:text-red-600 transition-all shadow-[0_10px_40px_rgba(220,38,38,0.4)] disabled:opacity-10 active:scale-95 italic"
                >
                  {commenting ? '전송 중...' : '댓글 등록'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 🔴 게시판 돌아가기 네비게이션 */}
        <div className="flex justify-between items-center px-10 pt-10">
          <button 
            onClick={() => navigate('/community')} 
            className="flex items-center gap-3 text-gray-600 hover:text-red-600 transition-all group"
          >
            <span className="text-xl group-hover:-translate-x-2 transition-transform">←</span>
            <span className="font-black uppercase italic text-xs tracking-[0.2em]">List Archive</span>
          </button>
          
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-black uppercase italic text-[10px] text-gray-800 hover:text-white transition-all"
          >
            Back to Top ↑
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
