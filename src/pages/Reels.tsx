import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import type { Reel } from '../types';
import { timeAgo } from '../lib/utils';
import { Heart, MessageCircle, Play, Film, Volume2, VolumeX } from 'lucide-react';

export default function Reels() {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      let data: Reel[] = [];

      if (user) {
        const { data: follows } = await supabase
          .from('follows')
          .select('followee_id')
          .eq('follower_id', user.id);
        const followeeIds = (follows ?? []).map((f) => f.followee_id);
        if (followeeIds.length > 0) {
          const { data: followedReels } = await supabase
            .from('reels')
            .select('*, profile:profiles!reels_user_id_fkey(*)')
            .in('user_id', followeeIds)
            .order('created_at', { ascending: false })
            .limit(50);
          data = (followedReels ?? []) as unknown as Reel[];
        }
      }

      if (data.length === 0) {
        const { data: allReels } = await supabase
          .from('reels')
          .select('*, profile:profiles!reels_user_id_fkey(*)')
          .order('created_at', { ascending: false })
          .limit(50);
        data = (allReels ?? []) as unknown as Reel[];
      }

      if (!active) return;
      setReels(data);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user?.id]);

  // Intersection observer to autoplay the visible reel
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const videos = Array.from(container.querySelectorAll('video'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: [0, 0.6, 1] }
    );
    videos.forEach((v) => observer.observe(v));
    return () => observer.disconnect();
  }, [reels]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Film className="w-6 h-6 text-gray-400 animate-pulse" />
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Film className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">No reels yet</h3>
        <p className="text-gray-500 mt-1">
          Follow creators to see their reels here. For now, explore posts from the community.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="max-w-md mx-auto space-y-4">
      <div className="flex items-center justify-end mb-2">
        <button
          onClick={() => setMuted((m) => !m)}
          className="p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
      {reels.map((reel) => (
        <div
          key={reel.id}
          className="relative rounded-2xl overflow-hidden bg-black shadow-lg aspect-[9/16] max-h-[80vh] mx-auto"
        >
          <video
            src={reel.video_url}
            loop
            muted={muted}
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

          <div className="absolute top-3 left-3 right-3 flex items-center gap-2">
            <button
              onClick={() => navigate({ name: 'profile', userId: reel.user_id })}
              className="flex items-center gap-2"
            >
              {reel.profile?.avatar_url ? (
                <img src={reel.profile.avatar_url} alt={reel.profile.username} className="w-9 h-9 rounded-full object-cover ring-2 ring-white/80" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-cyan-300 flex items-center justify-center text-white font-semibold ring-2 ring-white/80">
                  {reel.profile?.username?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
              <span className="text-white font-semibold text-sm drop-shadow">@{reel.profile?.username}</span>
            </button>
            <span className="text-white/70 text-xs ml-auto">{timeAgo(reel.created_at)}</span>
          </div>

          {reel.caption && (
            <div className="absolute bottom-16 left-3 right-12">
              <p className="text-white text-sm leading-relaxed drop-shadow line-clamp-3">{reel.caption}</p>
            </div>
          )}

          <div className="absolute bottom-3 right-3 flex flex-col gap-4 items-center">
            <button className="text-white hover:scale-110 transition">
              <Heart className="w-7 h-7 drop-shadow" />
            </button>
            <button className="text-white hover:scale-110 transition">
              <MessageCircle className="w-7 h-7 drop-shadow" />
            </button>
          </div>

          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white/80 text-xs">
            <Play className="w-3 h-3 fill-white/80" /> Reel
          </div>
        </div>
      ))}
    </div>
  );
}
