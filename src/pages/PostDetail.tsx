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
  const [isLiked, setIsLiked] = useState(false); // 🔴 추천 상태 추가

  useEffect(() => {
    fetchPostData();
    if (id) supabase.rpc('increment_views', { post_id: id });
    if (currentUser && id) checkLikeStatus();
  }, [id, currentUser]);

  const checkLikeStatus = async () => {
    const { data } = await supabase.from('post_likes').select('*').eq('post_id', id).eq('user_id', currentUser?.id).single();
    if (data) setIsLiked(true);
  };

  const fetchPostData = async () => {
    if (!id) return;
    setLoading(true);
    const { data } = await supabase.from('posts').select('*, author:profiles(*)').eq('id', id).single();
    if (!data) return navigate('/community');
    setPost(data);

    const { data: comms } = await supabase.from('comments').select('*, author:profiles(*)').eq('post_id', id).order('created_at', { ascending: true });
    if (comms) setComments(comms);
    setLoading(false);
  };

  // 🔴 추천 로직 (작성자에게 2P 보너스)
  const handleLike = async () => {
    if (!currentUser) return alert('로그인이 필요합니다.');
    if (isLiked) return alert('이미 추천한 게시글입니다.');

    try {
      const { error: likeErr } = await supabase.from('post_likes').insert([{ post_id: id, user_id: currentUser.id }]);
      if (likeErr) throw likeErr;

      // 작성자 포인트 +2P
      await supabase.from('profiles').update({ points: (post.author.points || 0) + 2 }).eq('id', post.author_id);
      // 게시글 추천수 +1
      await supabase.from('posts').update({ likes: (post.likes || 0) + 1 }).eq('id', id);

      setIsLiked(true);
      fetchPostData();
      alert('추천 완료! 작성자에게 보너스 포인트가 지급되었습니다.');
    } catch (e) { alert('이미 추천하셨습니다.'); }
  };

  // 🔴 삭제 로직
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
    if (!currentUser || !newComment.trim()) return;
    setCommenting(true);
    await supabase.from('comments').insert([{ post_id: id, author_id: currentUser.id, content: newComment }]);
    await supabase.from('profiles').update({ points: (currentUser.points || 0) + 5 }).eq('id', currentUser.id);
    await supabase.from('point_history').insert([{ user_id: currentUser.id, amount: 5, reason: '댓글 작성 보상' }]);
    setNewComment('');
    fetchPostData();
    setCommenting(false);
  };

  if (loading || !post) return <div className="min-h-screen bg-black flex items-center justify-center text-white">LOADING...</div>;

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-[#0f0f0f] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
          <header className="p-10 md:p-16 border-b border-white/5">
            <div className="flex justify-between items-start mb-8">
              <span className="px-4 py-1 bg-red-600 text-white text-[10px] font-black rounded-full uppercase italic tracking-widest">{post.category}</span>
              {/* 🔴 수정/삭제 버튼 제어 */}
              {(currentUser?.id === post.author_id || currentUser?.role === 'ADMIN') && (
                <div className="flex gap-4">
                  <Link to={`/post/edit/${id}`} className="text-gray-500 hover:text-white text-xs font-bold uppercase">Edit</Link>
                  <button onClick={handleDelete} className="text-red-500 hover:text-red-400 text-xs font-bold uppercase">Delete</button>
                </div>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-10 italic tracking-tighter">{post.title}</h1>
            <div className="flex justify-between items-center pt-8 border-t border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 overflow-hidden">
                  <img src={post.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.nickname}`} alt="avatar" />
                </div>
                <div>
                  <p className="text-white font-black">{post.author?.nickname}</p>
                  <p className="text-yellow-500 text-[10px] font-black uppercase">Lv.{post.author?.level}</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-8">
                {/* 🔴 추천 버튼 UI */}
                <button 
                  onClick={handleLike} 
                  className={`flex flex-col items-center gap-1 transition-all ${isLiked ? 'text-red-500 scale-110' : 'text-gray-500 hover:text-red-500'}`}
                >
                  <span className="text-2xl">{isLiked ? '❤️' : '🤍'}</span>
                  <span className="text-[10px] font-black uppercase">Like {post.likes || 0}</span>
                </button>
                <div className="text-[10px] text-gray-600 font-bold uppercase">
                  <p>Views {post.views || 0}</p>
                  <p>{new Date(post.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </header>
          <article className="p-10 md:p-16 text-gray-300 text-xl leading-relaxed whitespace-pre-wrap font-medium">
            {post.content}
            {post.image_urls?.map((url: string, i: number) => <img key={i} src={url} className="w-full rounded-[2.5rem] mt-10" alt="content" />)}
          </article>
        </div>

        <div className="bg-[#0f0f0f] rounded-[3rem] p-10 md:p-16 shadow-2xl">
          <h3 className="text-2xl font-black text-white italic mb-10 uppercase tracking-widest flex items-center gap-3">
            <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span> Comments ({comments.length})
          </h3>
          <div className="space-y-8 mb-12">
            {comments.map((comm) => (
              <div key={comm.id} className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden">
                  <img src={comm.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comm.author?.nickname}`} alt="avt" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between"><span className="text-white font-black text-sm">{comm.author?.nickname} Lv.{comm.author?.level}</span><span className="text-[10px] text-gray-600">{new Date(comm.created_at).toLocaleString()}</span></div>
                  <p className="text-gray-400 text-lg font-medium">{comm.content}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleCommentSubmit} className="relative group">
            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="댓글 작성 시 5P 적립!" className="w-full bg-black border border-white/10 rounded-[2rem] px-8 py-6 text-white outline-none focus:border-red-600 min-h-[120px]" />
            <button type="submit" disabled={commenting} className="absolute bottom-4 right-4 bg-red-600 text-white px-8 py-3 rounded-xl font-black uppercase text-xs">POST +5P</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
