import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext'; // 

const PostDetail: React.FC = () => { // 🔴 프롭 제거
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // 1. 전역 인증 정보 가져오기
  const { currentUser, loading: authLoading } = useAuth(); 

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // 🔴 데이터 로드 및 조회수 증강
  useEffect(() => {
    if (id) {
      fetchPostData();
      incrementViews();
    }
  }, [id]);

  // 🔴 인증 확인이 완료되고 유저 정보가 있을 때만 추천 상태 확인
  useEffect(() => {
    if (!authLoading && currentUser && id) {
      checkLikeStatus();
    }
  }, [id, currentUser?.id, authLoading]);

  const incrementViews = async () => {
    if (!id) return;
    await supabase.rpc('increment_views', { post_id: id });
  };

  const checkLikeStatus = async () => {
    const { data } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', id)
      .eq('user_id', currentUser?.id)
      .single();
    if (data) setIsLiked(true);
  };

  const fetchPostData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data: postData, error: postErr } = await supabase
        .from('posts')
        .select('*, author:profiles(*)')
        .eq('id', id)
        .single();
      
      if (postErr || !postData) {
        navigate('/community');
        return;
      }
      setPost(postData);

      const { data: comms } = await supabase
        .from('comments')
        .select('*, author:profiles(*)')
        .eq('post_id', id)
        .order('created_at', { ascending: true });
      if (comms) setComments(comms);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!currentUser) return alert('로그인이 필요합니다.');
    if (isLiked) return alert('이미 추천한 게시글입니다.');

    try {
      const { error: likeErr } = await supabase
        .from('post_likes')
        .insert([{ post_id: id, user_id: currentUser.id }]);
      if (likeErr) throw likeErr;

      await supabase.from('profiles')
        .update({ points: (post.author.points || 0) + 2 })
        .eq('id', post.author_id);
      
      await supabase.from('posts')
        .update({ likes: (post.likes || 0) + 1 })
        .eq('id', id);

      setIsLiked(true);
      fetchPostData(); 
      alert('추천 완료! 작성자에게 2P가 지급되었습니다.');
    } catch (e) {
      alert('처리 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (!error) {
      alert('삭제되었습니다.');
      navigate('/community');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return alert('로그인이 필요합니다.');
    if (!newComment.trim()) return;

    setCommenting(true);
    try {
      await supabase.from('comments').insert([{ 
        post_id: id, 
        author_id: currentUser.id, 
        content: newComment 
      }]);

      await supabase.from('profiles')
        .update({ points: (currentUser.points || 0) + 5 })
        .eq('id', currentUser.id);

      await supabase.from('point_history').insert([{ 
        user_id: currentUser.id, 
        amount: 5, 
        reason: '댓글 작성 보상' 
      }]);

      setNewComment('');
      fetchPostData(); 
    } catch (err) {
      alert('댓글 등록 실패');
    } finally {
      setCommenting(false);
    }
  };

  // 게시글 데이터 로딩 중일 때만 스피너 표시
  if (loading || !post) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white font-black italic animate-pulse tracking-widest uppercase">
        Loading Confidential Data...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 font-sans selection:bg-red-600/30">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-[#0f0f0f] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
          <header className="p-10 md:p-16 border-b border-white/5">
            <div className="flex justify-between items-start mb-8">
              <span className="px-4 py-1 bg-red-600 text-white text-[10px] font-black rounded-full uppercase italic tracking-widest">
                #{post.category}
              </span>
              {/* 🔴 권한 체크 로직 (authLoading이 아닐 때만 정확히 판별) */}
              {!authLoading && (currentUser?.id === post.author_id || currentUser?.role === 'ADMIN') && (
                <div className="flex gap-4">
                  <Link to={`/post/edit/${id}`} className="text-gray-500 hover:text-white text-[10px] font-black uppercase italic transition-colors">Edit</Link>
                  <button onClick={handleDelete} className="text-red-600/50 hover:text-red-500 text-[10px] font-black uppercase italic transition-colors">Delete</button>
                </div>
              )}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black text-white mb-10 italic tracking-tighter leading-tight break-keep">
              {post.title}
            </h1>

            <div className="flex justify-between items-center pt-8 border-t border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                  <img src={post.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.nickname}`} alt="avatar" />
                </div>
                <div>
                  <p className="text-white font-black italic">{post.author?.nickname}</p>
                  <p className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Lv.{post.author?.level} Verified</p>
                </div>
              </div>
              
              <div className="flex items-center gap-8">
                <button 
                  onClick={handleLike} 
                  className={`flex flex-col items-center gap-1 transition-all ${isLiked ? 'text-red-500 scale-110' : 'text-gray-500 hover:text-red-500'}`}
                >
                  <span className="text-2xl">{isLiked ? '❤️' : '🤍'}</span>
                  <span className="text-[9px] font-black uppercase italic">Like {post.likes || 0}</span>
                </button>
                <div className="text-right text-[9px] text-gray-600 font-black uppercase tracking-tighter">
                  <p className="mb-1">Views {post.views || 0}</p>
                  <p>{new Date(post.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </header>

          <article className="p-10 md:p-16 text-gray-300 text-lg md:text-xl leading-relaxed whitespace-pre-wrap font-medium">
            {post.content}
            {post.image_urls?.map((url: string, i: number) => (
              <img key={i} src={url} className="w-full rounded-[2.5rem] mt-10 shadow-2xl border border-white/5" alt="content" />
            ))}
          </article>
        </div>

        <div className="bg-[#0f0f0f] rounded-[3rem] p-10 md:p-16 shadow-2xl border border-white/5">
          <h3 className="text-2xl font-black text-white italic mb-12 uppercase tracking-widest flex items-center gap-4">
            <span className="w-2 h-8 bg-red-600 rounded-full"></span> 
            Comments <span className="text-red-600">({comments.length})</span>
          </h3>
          
          <div className="space-y-10 mb-16">
            {comments.length === 0 ? (
              <p className="text-center text-gray-700 font-black italic uppercase py-10">No comments yet.</p>
            ) : (
              comments.map((comm) => (
                <div key={comm.id} className="flex gap-6 items-start group">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0">
                    <img src={comm.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comm.author?.nickname}`} alt="avt" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-black text-xs italic uppercase">
                        {comm.author?.nickname} <span className="text-yellow-600 ml-2">LV.{comm.author?.level}</span>
                      </span>
                      <span className="text-[9px] text-gray-600 font-bold">{new Date(comm.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-400 text-base md:text-lg leading-relaxed">{comm.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleCommentSubmit} className="relative mt-12">
            <textarea 
              value={newComment} 
              onChange={(e) => setNewComment(e.target.value)} 
              placeholder={currentUser ? "댓글 작성 시 5P 적립!" : "로그인이 필요합니다."}
              disabled={authLoading || !currentUser}
              className="w-full bg-black border border-white/10 rounded-[2rem] px-8 py-6 text-white outline-none focus:border-red-600 min-h-[140px] transition-all resize-none placeholder:text-gray-700" 
            />
            <button 
              type="submit" 
              disabled={commenting || authLoading || !currentUser} 
              className="absolute bottom-6 right-6 bg-red-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs hover:bg-white hover:text-red-600 transition-all shadow-xl disabled:opacity-20"
            >
              {commenting ? 'Posting...' : 'Post +5P'}
            </button>
          </form>
        </div>

        <div className="flex justify-center">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-white font-black uppercase italic text-xs tracking-widest transition-colors">
            ← Back to Community
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
