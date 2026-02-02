import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext'; 
import { useFetchGuard } from '../hooks/useFetchGuard'; 

const PostDetail: React.FC = () => {
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

  /**
   * 🔴 [방탄 fetch] 데이터 호출 로직
   * 게시글, 작성자 정보, 댓글 리스트를 한 번에 동기화합니다.
   * 어떤 구간에서 406 에러가 나더라도 finally가 로딩을 풉니다.
   */
  const fetchPostData = async () => {
    if (!id) return;
    setLoading(true); // 로딩 시작
    try {
      // 1. 게시글 및 작성자 정보 로드
      const { data: postData, error: postErr } = await supabase
        .from('posts')
        .select('*, author:profiles(*)')
        .eq('id', id)
        .single();
      
      if (postErr || !postData) {
        // 데이터가 없거나 에러가 나면 즉시 catch로 던짐
        throw postErr || new Error("Post not found");
      }
      setPost(postData);

      // 2. 댓글 리스트 로드
      const { data: comms, error: commErr } = await supabase
        .from('comments')
        .select('*, author:profiles(*)')
        .eq('post_id', id)
        .order('created_at', { ascending: true });
      
      if (commErr) throw commErr;
      if (comms) setComments(comms);

      // 3. 조회수 증강 (병렬 실행 - 성공 여부 무관)
      supabase.rpc('increment_views', { post_id: id });
      
    } catch (err: any) {
      console.error("게시글 로드 실패 (406 등):", err.message);
      // 게시글을 못 찾으면 튕겨줌
      if (err.message?.includes("Post not found") || err.code === "PGRST116") {
         alert('삭제되었거나 존재하지 않는 게시글입니다.');
         navigate('/community');
      }
    } finally {
      // 🔴 핵심: 성공하든 실패하든 무조건 로딩 종료
      setLoading(false);
    }
  };

  // 🔴 [데이터 가드 적용] 인증 정보 확인 후 데이터 호출
  useFetchGuard(fetchPostData, [id]);

  // 4. 추천(좋아요) 상태 확인 (별도 useEffect 유지)
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!currentUser || !id) return;
      try {
        const { data } = await supabase
          .from('post_likes')
          .select('*')
          .eq('post_id', id)
          .eq('user_id', currentUser.id)
          .single();
        if (data) setIsLiked(true);
      } catch (e) {
        // 좋아요 기록 없음 (에러 무시 가능)
      }
    };

    if (!authLoading && currentUser) {
      checkLikeStatus();
    }
  }, [id, currentUser, authLoading]);

  const handleLike = async () => {
    if (!currentUser) return alert('로그인이 필요합니다.');
    if (isLiked) return alert('이미 추천한 게시글입니다.');

    try {
      const { error: likeErr } = await supabase
        .from('post_likes')
        .insert([{ post_id: id, user_id: currentUser.id }]);
      if (likeErr) throw likeErr;

      // 추천수 업데이트 (Author 포인트 증강은 보안상 서버 Function 권장하지만 프런트 로직 유지)
      await supabase.from('profiles').update({ points: (post.author.points || 0) + 2 }).eq('id', post.author_id);
      await supabase.from('posts').update({ likes: (post.likes || 0) + 1 }).eq('id', id);

      setIsLiked(true);
      fetchPostData(); 
      alert('추천 완료! 작성자에게 2P가 지급되었습니다.');
    } catch (e) {
      alert('추천 처리 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까? 데이터는 복구되지 않습니다.')) return;
    try {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) throw error;
      alert('게시글이 영구 삭제되었습니다.');
      navigate('/community');
    } catch (err) {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return alert('로그인이 필요합니다.');
    if (!newComment.trim()) return;

    setCommenting(true);
    try {
      const { error: commErr } = await supabase.from('comments').insert([{ 
        post_id: id, 
        author_id: currentUser.id, 
        content: newComment 
      }]);
      if (commErr) throw commErr;

      // 포인트 지급 로직
      await supabase.from('profiles').update({ points: (currentUser.points || 0) + 5 }).eq('id', currentUser.id);
      await supabase.from('point_history').insert([{ 
        user_id: currentUser.id, amount: 5, reason: '댓글 작성 보상' 
      }]);

      setNewComment('');
      fetchPostData(); 
    } catch (err) {
      alert('댓글 등록 중 서버 오류가 발생했습니다.');
    } finally {
      setCommenting(false);
    }
  };

  // 🔴 전체 로딩 가드 (데이터가 준비될 때까지 안전하게 대기)
  if (authLoading || loading || !post) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white font-black italic animate-pulse tracking-widest uppercase text-xl">
        Accessing Post Intelligence...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 font-sans selection:bg-red-600/30">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
        <div className="bg-[#0f0f0f] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
          <header className="p-10 md:p-16 border-b border-white/5">
            <div className="flex justify-between items-start mb-8">
              <span className="px-4 py-1 bg-red-600 text-white text-[10px] font-black rounded-full uppercase italic tracking-widest shadow-lg shadow-red-600/20">
                #{post.category.toUpperCase()}
              </span>
              {!authLoading && (currentUser?.id === post.author_id || currentUser?.role === 'ADMIN') && (
                <div className="flex gap-4">
                  <Link to={`/post/edit/${id}`} className="text-gray-500 hover:text-white text-[10px] font-black uppercase italic transition-colors">Edit Records</Link>
                  <button onClick={handleDelete} className="text-red-600/50 hover:text-red-500 text-[10px] font-black uppercase italic transition-colors">Terminate</button>
                </div>
              )}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black text-white mb-10 italic tracking-tighter leading-tight break-keep">
              {post.title}
            </h1>

            <div className="flex justify-between items-center pt-8 border-t border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 overflow-hidden shadow-xl">
                  <img src={post.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.nickname}`} alt="avatar" />
                </div>
                <div>
                  <p className="text-white font-black italic text-lg tracking-tight">{post.author?.nickname}</p>
                  <p className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Lv.{post.author?.level} Verified Member</p>
                </div>
              </div>
              
              <div className="flex items-center gap-8">
                <button 
                  onClick={handleLike} 
                  className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${isLiked ? 'text-red-500 scale-110' : 'text-gray-500 hover:text-red-500'}`}
                >
                  <span className="text-2xl">{isLiked ? '❤️' : '🤍'}</span>
                  <span className="text-[9px] font-black uppercase italic tracking-tighter">Recommended {post.likes || 0}</span>
                </button>
                <div className="text-right text-[9px] text-gray-600 font-black uppercase tracking-tighter italic">
                  <p className="mb-1">Views {post.views || 0}</p>
                  <p>{new Date(post.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </header>

          <article className="p-10 md:p-16 text-gray-300 text-lg md:text-xl leading-relaxed whitespace-pre-wrap font-medium italic">
            {post.content}
            {post.image_urls?.map((url: string, i: number) => (
              <img key={i} src={url} className="w-full rounded-[2.5rem] mt-10 shadow-2xl border border-white/5 hover:scale-[1.01] transition-transform duration-500" alt="content" />
            ))}
          </article>
        </div>

        {/* 댓글 섹션 */}
        <div className="bg-[#0f0f0f] rounded-[3rem] p-10 md:p-16 shadow-2xl border border-white/5">
          <h3 className="text-2xl font-black text-white italic mb-12 uppercase tracking-widest flex items-center gap-4">
            <span className="w-2 h-8 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"></span> 
            Intel Feed <span className="text-red-600">({comments.length})</span>
          </h3>
          
          <div className="space-y-10 mb-16">
            {comments.length === 0 ? (
              <p className="text-center text-gray-700 font-black italic uppercase py-10 opacity-50">No data transmitted yet.</p>
            ) : (
              comments.map((comm) => (
                <div key={comm.id} className="flex gap-6 items-start group animate-in slide-in-from-left-4 duration-500">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0 shadow-lg">
                    <img src={comm.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comm.author?.nickname}`} alt="avt" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-black text-xs italic uppercase tracking-tight">
                        {comm.author?.nickname} <span className="text-yellow-600 ml-2 border-l border-white/10 pl-2">LV.{comm.author?.level}</span>
                      </span>
                      <span className="text-[9px] text-gray-600 font-bold italic">{new Date(comm.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-400 text-base md:text-lg leading-relaxed italic">{comm.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleCommentSubmit} className="relative mt-12">
            <textarea 
              value={newComment} 
              onChange={(e) => setNewComment(e.target.value)} 
              placeholder={currentUser ? "댓글 작성 시 5P 적립 및 기록 갱신" : "로그인이 필요한 구역입니다."}
              disabled={authLoading || !currentUser}
              className="w-full bg-black border border-white/10 rounded-[2.5rem] px-8 py-7 text-white outline-none focus:border-red-600 min-h-[160px] transition-all resize-none placeholder:text-gray-800 italic font-bold" 
            />
            <button 
              type="submit" 
              disabled={commenting || authLoading || !currentUser} 
              className="absolute bottom-8 right-8 bg-red-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs hover:bg-white hover:text-red-600 transition-all shadow-xl disabled:opacity-20 active:scale-95 italic"
            >
              {commenting ? 'Transmitting...' : 'Post +5P'}
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
