import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Post } from '../types';
import PostCard, { PostCardSkeleton } from '../components/PostCard';
import { useDebounced } from '../lib/utils';
import { Loader2, Frown } from 'lucide-react';

export default function HomeFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const debouncedRefresh = useDebounced(refreshKey, 200);

  useEffect(() => {
    const handler = () => setRefreshKey((k) => k + 1);
    window.addEventListener('socialhub:post-created', handler);
    return () => window.removeEventListener('socialhub:post-created', handler);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from('posts')
        .select('*, profile:profiles!posts_user_id_fkey(*)')
        .order('created_at', { ascending: false })
        .limit(50);
      if (!active) return;
      const base = (data ?? []) as unknown as Post[];
      if (base.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }
      const postIds = base.map((p) => p.id);
      const [{ data: likes }, { data: counts }, { data: commentCounts }] = await Promise.all([
        supabase.from('likes').select('post_id').eq('user_id', user?.id ?? ''),
        supabase.from('likes').select('post_id').in('post_id', postIds),
        supabase.from('comments').select('post_id').in('post_id', postIds),
      ]);
      if (!active) return;
      const likedSet = new Set((likes ?? []).map((l) => l.post_id));
      const likeMap = new Map<string, number>();
      (counts ?? []).forEach((l) => likeMap.set(l.post_id, (likeMap.get(l.post_id) ?? 0) + 1));
      const commentMap = new Map<string, number>();
      (commentCounts ?? []).forEach((c) => commentMap.set(c.post_id, (commentMap.get(c.post_id) ?? 0) + 1));
      const enriched = base.map((p) => ({
        ...p,
        liked_by_me: likedSet.has(p.id),
        like_count: likeMap.get(p.id) ?? 0,
        comment_count: commentMap.get(p.id) ?? 0,
      }));
      setPosts(enriched);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user?.id, debouncedRefresh]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        {[0, 1, 2].map((i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Frown className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Your feed is empty</h3>
        <p className="text-gray-500 mt-1">Be the first to share something, or explore other creators.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
      <div className="text-center py-4 text-gray-400 text-sm flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> You're all caught up
      </div>
    </div>
  );
}
