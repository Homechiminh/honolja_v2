import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // 🔴 Link 제거됨
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
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const fetchPostData = async () => {
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
      console.error("Post Detail Fetch Failed:", err.message);
      if (err.message?.includes("Post not found")) {
         alert('삭제되었거나 존재하지 않는 게시글입니다.');
         navigate('/community');
      }
    } finally {
      setLoading(false);
    }
  };

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

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return alert('로그인이 필요합니다.');
    if (!newComment.trim()) return;

    setCommenting(true);
    try {
      const { error: commErr } = await supabase.from('comments').insert([{ 
        post_id: id, author_id: currentUser.id, content: newComment 
      }]);
      if (commErr) throw commErr;

      try {
        await supabase.from('profiles').update({ points: (currentUser.points || 0) + 5 }).eq('id', currentUser.id);
        await supabase.from('point_history').insert([{ 
          user_id: currentUser.id, amount: 5, reason: '댓글 작성 보상' 
        }]);
      } catch (pErr) {
        console.warn("Point update failed:", pErr);
      }

      setNewComment('');
      fetchPostData(); 
    } catch (err: any) {
      alert(`댓글 등록 실패: ${err.message}`);
    } finally {
      setCommenting(false);
    }
  };

  if (!initialized || loading || !post) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white font-black italic animate-pulse uppercase">Accessing Post Intelligence...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 font-sans">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
        <div className="bg-[#0f0f0f] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
          <header className="p-10 md:p-16 border-b border-white/5">
            <span className="px-4 py-1 bg-red-600 text-white text-[10px] font-black rounded-full uppercase italic tracking-widest shadow-lg shadow-red-600/20">#{post.category.toUpperCase()}</span>
            <h1 className="text-3xl md:text-5xl font-black text-white mt-10 mb-10 italic tracking-tighter leading-tight">{post.title}</h1>
            <div className="flex justify-between items-center pt-8 border-t border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 overflow-hidden shadow-xl">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.nickname}`} alt="avatar" />
                </div>
                <div>
                  <p className="text-white font-black italic text-lg">{post.author?.nickname}</p>
                  <p className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Lv.{post.author?.level} Verified Member</p>
                </div>
              </div>
              <button onClick={handleLike} className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${isLiked ? 'text-red-500 scale-110' : 'text-gray-500 hover:text-red-500'}`}>
                <span className="text-2xl">{isLiked ? '❤️' : '🤍'}</span>
                <span className="text-[9px] font-black uppercase italic tracking-tighter">Recommended {post.likes || 0}</span>
              </button>
            </div>
          </header>
          <article className="p-10 md:p-16 text-gray-300 text-lg md:text-xl leading-relaxed whitespace-pre-wrap font-medium italic">{post.content}</article>
        </div>

        <div className="bg-[#0f0f0f] rounded-[3rem] p-10 md:p-16 shadow-2xl border border-white/5">
          <h3 className="text-2xl font-black text-white italic mb-12 uppercase tracking-widest flex items-center gap-4">
            <span className="w-2 h-8 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"></span> 
            댓글창 <span className="text-red-600">({comments.length})</span>
          </h3>
          <div className="space-y-10 mb-16">
            {comments.length === 0 ? (
              <p className="text-center text-gray-700 font-black italic uppercase py-10 opacity-50">첫 댓글을 남겨보세요.</p>
            ) : (
              comments.map((comm) => (
                <div key={comm.id} className="flex gap-6 items-start group">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0 shadow-lg"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comm.author?.nickname}`} alt="avt" /></div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-black text-xs italic uppercase">{comm.author?.nickname} <span className="text-yellow-600 ml-2">LV.{comm.author?.level}</span></span>
                      <span className="text-[9px] text-gray-600 font-bold italic">{new Date(comm.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-400 text-base md:text-lg leading-relaxed italic">{comm.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleCommentSubmit} className="relative mt-12">
            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder={currentUser ? "댓글 작성 시 5P 적립 및 기록 갱신" : "로그인이 필요한 구역입니다."} disabled={!currentUser} className="w-full bg-black border border-white/10 rounded-[2.5rem] px-8 py-7 text-white outline-none focus:border-red-600 min-h-[160px] transition-all resize-none italic font-bold" />
            <button type="submit" disabled={commenting || !currentUser} className="absolute bottom-8 right-8 bg-red-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs hover:bg-white hover:text-red-600 transition-all shadow-xl disabled:opacity-20 active:scale-95 italic">
              {commenting ? '전송중...' : '등록 +5P'}
            </button>
          </form>
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
