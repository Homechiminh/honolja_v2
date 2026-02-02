import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

      supabase.rpc('increment_views', { post_id: id });
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

  // 포인트 지급 판독기 (UI에는 안보이지만 내부 로직은 유지)
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
      <div className="text-white font-black italic animate-pulse uppercase tracking-widest">Accessing Intelligence...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 font-sans selection:bg-red-600/30">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* 게시글 영역 */}
        <div className="bg-[#0f0f0f] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
          <header className="p-10 md:p-16 border-b border-white/5">
            <span className="px-4 py-1 bg-red-600 text-white text-[10px] font-black rounded-full uppercase italic tracking-widest shadow-lg shadow-red-600/20">#{post.category.toUpperCase()}</span>
            <h1 className="text-3xl md:text-5xl font-black text-white mt-10 mb-10 italic tracking-tighter leading-tight">{post.title}</h1>
            <div className="flex justify-between items-center pt-8 border-t border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 overflow-hidden shadow-xl">
                  <img src={post.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.nickname}`} alt="avatar" />
                </div>
                <div>
                  <p className="text-white font-black italic text-lg">{post.author?.nickname}</p>
                  <p className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Lv.{post.author?.level} Agent</p>
                </div>
              </div>
              <button onClick={handleLike} className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${isLiked ? 'text-red-500 scale-110' : 'text-gray-500 hover:text-red-500'}`}>
                <span className="text-2xl">{isLiked ? '❤️' : '🤍'}</span>
                <span className="text-[9px] font-black uppercase italic tracking-tighter">Recommended {post.likes || 0}</span>
              </button>
            </div>
          </header>
          <article className="p-10 md:p-16 text-gray-300 text-lg md:text-xl leading-relaxed whitespace-pre-wrap font-medium italic">
            {post.image_urls?.map((url: string, i: number) => (
              <img key={i} src={url} alt="post-img" className="w-full rounded-3xl mb-8 border border-white/5 shadow-2xl" />
            ))}
            {post.content}
          </article>
        </div>

        {/* 댓글 영역 */}
        <div className="bg-[#0f0f0f] rounded-[3rem] p-10 md:p-16 shadow-2xl border border-white/5">
          <h3 className="text-2xl font-black text-white italic mb-12 uppercase tracking-widest flex items-center gap-4">
            <span className="w-2 h-8 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"></span> 
            LOGS <span className="text-red-600">({comments.length})</span>
          </h3>
          
          <div className="space-y-12 mb-16">
            {commentTree.map((comm) => (
              <div key={comm.id} className="space-y-6">
                <div className="flex gap-6 items-start group">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0 shadow-lg">
                    <img src={comm.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comm.author?.nickname}`} alt="avt" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-black text-xs italic uppercase">
                        {comm.author?.nickname} <span className="text-yellow-600 ml-2">LV.{comm.author?.level}</span>
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-[9px] text-gray-600 font-bold italic">{new Date(comm.created_at).toLocaleString()}</span>
                        <button onClick={() => setReplyToId(comm.id)} className="text-[10px] font-black text-red-600 uppercase hover:underline">Reply</button>
                        
                        {(currentUser?.id === comm.author_id || currentUser?.role === 'ADMIN') && (
                          <button onClick={() => handleDeleteComment(comm.id)} className="text-[10px] font-black text-gray-600 uppercase hover:text-red-600 transition-colors">Delete</button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-400 text-base md:text-lg leading-relaxed italic">{comm.content}</p>
                  </div>
                </div>

                <div className="ml-16 space-y-8 border-l-2 border-white/5 pl-8">
                  {comm.replies.map((reply: any) => (
                    <div key={reply.id} className="flex gap-4 items-start group">
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden shrink-0">
                        <img src={reply.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.author?.nickname}`} alt="avt" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 font-black text-[11px] italic uppercase">
                            {reply.author?.nickname} <span className="text-yellow-600 ml-1">LV.{reply.author?.level}</span>
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-[8px] text-gray-700 font-bold italic">{new Date(reply.created_at).toLocaleString()}</span>
                            {(currentUser?.id === reply.author_id || currentUser?.role === 'ADMIN') && (
                              <button onClick={() => handleDeleteComment(reply.id)} className="text-[8px] font-black text-gray-700 uppercase hover:text-red-600 transition-colors">Delete</button>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-500 text-base leading-relaxed italic">{reply.content}</p>
                      </div>
                    </div>
                  ))}

                  {replyToId === comm.id && (
                    <div className="mt-4 animate-in slide-in-from-top-2">
                      <textarea 
                        value={newComment} 
                        onChange={(e) => setNewComment(e.target.value)} 
                        placeholder="답글을 남겨주세요." 
                        className="w-full bg-black border border-red-600/30 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-red-600 transition-all resize-none italic font-bold"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button onClick={() => {setReplyToId(null); setNewComment('');}} className="px-4 py-2 text-[10px] font-black text-gray-500 uppercase italic">Cancel</button>
                        <button onClick={(e) => handleCommentSubmit(e, comm.id)} className="bg-red-600 text-white px-6 py-2 rounded-xl font-black uppercase text-[10px] italic">Post Reply</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 🔴 문구 수정: 포인트 적립 안내 삭제 및 버튼 텍스트 변경 */}
          {!replyToId && (
            <form onSubmit={(e) => handleCommentSubmit(e, null)} className="relative mt-12">
              <textarea 
                value={newComment} 
                onChange={(e) => setNewComment(e.target.value)} 
                placeholder={currentUser ? "댓글을 남겨보세요." : "로그인이 필요한 구역입니다."} 
                disabled={!currentUser} 
                className="w-full bg-black border border-white/10 rounded-[2.5rem] px-8 py-7 text-white outline-none focus:border-red-600 min-h-[160px] transition-all resize-none italic font-bold" 
              />
              <button 
                type="submit" 
                disabled={commenting || !currentUser} 
                className="absolute bottom-8 right-8 bg-red-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs hover:bg-white hover:text-red-600 transition-all shadow-xl disabled:opacity-20 active:scale-95 italic"
              >
                {commenting ? '전송중...' : '등록'}
              </button>
            </form>
          )}
        </div>

        <div className="flex justify-center">
          <button onClick={() => navigate(-1)} className="text-gray-700 hover:text-white font-black uppercase italic text-xs tracking-[0.3em] transition-all border-b border-transparent hover:border-white">
            ← Return to Community Archive
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
