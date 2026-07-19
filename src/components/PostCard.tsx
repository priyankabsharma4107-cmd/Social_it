import { useEffect, useState } from 'react';
import type { Post, Comment } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { timeAgo } from '../lib/utils';
import { Heart, MessageCircle, Send } from 'lucide-react';

export default function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [liked, setLiked] = useState(post.liked_by_me ?? false);
  const [likeCount, setLikeCount] = useState(post.like_count ?? 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);

  const toggleLike = async () => {
    if (!user) return;
    if (liked) {
      setLiked(false);
      setLikeCount((c) => Math.max(0, c - 1));
      await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', user.id);
    } else {
      setLiked(true);
      setLikeCount((c) => c + 1);
      await supabase.from('likes').insert({ post_id: post.id });
    }
  };

  const loadComments = async () => {
    setLoadingComments(true);
    const { data } = await supabase
      .from('comments')
      .select('*, profile:profiles!comments_user_id_fkey(*)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });
    setComments((data ?? []) as unknown as Comment[]);
    setLoadingComments(false);
  };

  useEffect(() => {
    if (showComments) loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showComments]);

  const submitComment = async () => {
    if (!commentText.trim() || !user) return;
    setPosting(true);
    const { data } = await supabase
      .from('comments')
      .insert({ post_id: post.id, text: commentText.trim() })
      .select('*, profile:profiles!comments_user_id_fkey(*)')
      .single();
    setPosting(false);
    if (data) {
      setComments((c) => [...c, data as unknown as Comment]);
      setCommentText('');
    }
  };

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => post.user_id && navigate({ name: 'profile', userId: post.user_id })}>
          {post.profile?.avatar_url ? (
            <img src={post.profile.avatar_url} alt={post.profile.username} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-cyan-300 flex items-center justify-center text-white font-semibold">
              {post.profile?.username?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <button
            onClick={() => post.user_id && navigate({ name: 'profile', userId: post.user_id })}
            className="font-semibold text-gray-900 text-sm hover:underline"
          >
            {post.profile?.username ?? 'unknown'}
          </button>
          <p className="text-xs text-gray-400">{timeAgo(post.created_at)}</p>
        </div>
      </div>

      {post.image_url && (
        <div className="bg-gray-50">
          <img src={post.image_url} alt={post.caption ?? 'post'} className="w-full max-h-[600px] object-cover" />
        </div>
      )}

      <div className="px-4 py-3">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={toggleLike} className="flex items-center gap-1.5 group">
            <Heart
              className={`w-6 h-6 transition ${liked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-gray-600 group-hover:text-rose-500'}`}
            />
            <span className="text-sm font-medium text-gray-700">{likeCount}</span>
          </button>
          <button onClick={() => setShowComments((s) => !s)} className="flex items-center gap-1.5 group">
            <MessageCircle className="w-6 h-6 text-gray-600 group-hover:text-sky-500 transition" />
            <span className="text-sm font-medium text-gray-700">{post.comment_count ?? 0}</span>
          </button>
        </div>

        {post.caption && (
          <p className="text-sm text-gray-800 leading-relaxed">
            <span className="font-semibold mr-1.5">{post.profile?.username}</span>
            {post.caption}
          </p>
        )}

        {showComments && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
            {loadingComments && <p className="text-sm text-gray-400">Loading…</p>}
            {!loadingComments && comments.length === 0 && (
              <p className="text-sm text-gray-400">No comments yet. Be the first.</p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="flex items-start gap-2 text-sm">
                <span className="font-semibold text-gray-900">{c.profile?.username}</span>
                <span className="text-gray-700 flex-1">{c.text}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                placeholder="Add a comment…"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none text-sm transition"
              />
              <button
                onClick={submitComment}
                disabled={posting || !commentText.trim()}
                className="p-2 rounded-lg text-sky-500 hover:bg-sky-50 disabled:opacity-40 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-10 h-10 rounded-full skeleton" />
        <div className="flex-1">
          <div className="h-3 w-24 rounded skeleton" />
          <div className="h-2 w-12 rounded skeleton mt-1" />
        </div>
      </div>
      <div className="w-full h-80 skeleton" />
      <div className="px-4 py-3 space-y-2">
        <div className="h-3 w-32 rounded skeleton" />
        <div className="h-3 w-3/4 rounded skeleton" />
      </div>
    </div>
  );
}

