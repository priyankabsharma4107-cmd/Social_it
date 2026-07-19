import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from '../context/RouterContext';
import type { Post, Profile } from '../types';
import { Search, Users, Image as ImageIcon } from 'lucide-react';

export default function Explore() {
  const { navigate } = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [creators, setCreators] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      const [{ data: postData }, { data: profileData }] = await Promise.all([
        supabase
          .from('posts')
          .select('*, profile:profiles!posts_user_id_fkey(*)')
          .order('created_at', { ascending: false })
          .limit(30),
        supabase.from('profiles').select('*').limit(20),
      ]);
      setPosts((postData ?? []) as unknown as Post[]);
      setCreators((profileData ?? []) as Profile[]);
      setLoading(false);
    })();
  }, []);

  const filteredPosts = query
    ? posts.filter(
        (p) =>
          p.caption?.toLowerCase().includes(query.toLowerCase()) ||
          p.profile?.username.toLowerCase().includes(query.toLowerCase())
      )
    : posts;

  const filteredCreators = query
    ? creators.filter((c) => c.username.toLowerCase().includes(query.toLowerCase()))
    : creators.slice(0, 6);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts and creators…"
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition shadow-sm"
        />
      </div>

      {filteredCreators.length > 0 && (
        <section className="mb-8">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            <Users className="w-4 h-4" /> Creators
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {filteredCreators.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate({ name: 'profile', userId: c.id })}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition"
              >
                {c.avatar_url ? (
                  <img src={c.avatar_url} alt={c.username} className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-cyan-300 flex items-center justify-center text-white font-bold text-lg">
                    {c.username[0]?.toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-800 truncate max-w-full">@{c.username}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          <ImageIcon className="w-4 h-4" /> Discover
        </h2>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl skeleton" />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No posts found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filteredPosts.map((p) => (
              <button
                key={p.id}
                onClick={() => p.user_id && navigate({ name: 'profile', userId: p.user_id })}
                className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100"
              >
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.caption ?? ''}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-3 text-center text-gray-500 text-sm">
                    {p.caption}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-3">
                  <span className="text-white text-xs font-medium truncate">@{p.profile?.username}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
