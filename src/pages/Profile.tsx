import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import type { Post, Profile } from '../types';
import { timeAgo } from '../lib/utils';
import PostCard from '../components/PostCard';
import { UserPlus, UserCheck, Settings, X, Loader2, Grid3x3 } from 'lucide-react';

export default function ProfilePage({ userId }: { userId: string }) {
  const { user, refreshProfile } = useAuth();
  const { navigate } = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [editing, setEditing] = useState(false);

  const isOwn = user?.id === userId;

  const loadAll = async () => {
    setLoading(true);
    const [{ data: profileData }, { data: postData }, { data: followers }, { data: following }, { data: followRow }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase
        .from('posts')
        .select('*, profile:profiles!posts_user_id_fkey(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase.from('follows').select('follower_id').eq('followee_id', userId),
      supabase.from('follows').select('followee_id').eq('follower_id', userId),
      user
        ? supabase.from('follows').select('follower_id').eq('follower_id', user.id).eq('followee_id', userId).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    setProfile(profileData as Profile | null);
    setPosts((postData ?? []) as unknown as Post[]);
    setFollowerCount((followers ?? []).length);
    setFollowingCount((following ?? []).length);
    setIsFollowing(!!followRow);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const toggleFollow = async () => {
    if (!user) return;
    setFollowLoading(true);
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('followee_id', userId);
      setIsFollowing(false);
      setFollowerCount((c) => Math.max(0, c - 1));
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, followee_id: userId });
      setIsFollowing(true);
      setFollowerCount((c) => c + 1);
    }
    setFollowLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-6 items-center mb-8">
          <div className="w-24 h-24 rounded-full skeleton" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 rounded skeleton" />
            <div className="h-3 w-48 rounded skeleton" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <h3 className="text-lg font-semibold text-gray-900">Profile not found</h3>
        <button onClick={() => navigate({ name: 'explore' })} className="text-sky-600 mt-2 hover:underline">
          Explore creators
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start mb-8 animate-fade-in">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.username} className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-md" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-400 to-cyan-300 flex items-center justify-center text-white text-3xl font-bold shadow-md">
            {profile.username[0]?.toUpperCase()}
          </div>
        )}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <h1 className="text-2xl font-bold text-gray-900">@{profile.username}</h1>
            {isOwn ? (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <Settings className="w-4 h-4" /> Edit profile
              </button>
            ) : (
              <button
                onClick={toggleFollow}
                disabled={followLoading}
                className={`inline-flex items-center gap-1.5 px-5 py-1.5 rounded-lg text-sm font-semibold transition ${
                  isFollowing
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-sky-500 text-white hover:bg-sky-600'
                }`}
              >
                {followLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isFollowing ? (
                  <UserCheck className="w-4 h-4" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
          {profile.full_name && <p className="text-gray-600 mt-1">{profile.full_name}</p>}
          <div className="flex gap-6 mt-3 justify-center sm:justify-start">
            <span className="text-sm text-gray-600">
              <strong className="text-gray-900">{posts.length}</strong> posts
            </span>
            <span className="text-sm text-gray-600">
              <strong className="text-gray-900">{followerCount}</strong> followers
            </span>
            <span className="text-sm text-gray-600">
              <strong className="text-gray-900">{followingCount}</strong> following
            </span>
          </div>
          {profile.bio && <p className="text-gray-700 mt-3 max-w-md">{profile.bio}</p>}
          <p className="text-xs text-gray-400 mt-2">Joined {timeAgo(profile.created_at)} ago</p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          <Grid3x3 className="w-4 h-4" /> Posts
        </h2>
        {posts.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No posts yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>

      {editing && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditing(false)}
          onSaved={async () => {
            await refreshProfile();
            await loadAll();
            setEditing(false);
          }}
        />
      )}
    </div>
  );
}

function EditProfileModal({
  profile,
  onClose,
  onSaved,
}: {
  profile: Profile;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [username, setUsername] = useState(profile.username);
  const [fullName, setFullName] = useState(profile.full_name ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    const { error } = await supabase
      .from('profiles')
      .update({
        username: username.trim(),
        full_name: fullName.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        bio: bio.trim() || null,
      })
      .eq('id', profile.id);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-lg text-gray-900">Edit profile</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Avatar URL</label>
            <input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://…"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none transition resize-none"
            />
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
        </div>
        <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-medium transition">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-semibold transition flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
