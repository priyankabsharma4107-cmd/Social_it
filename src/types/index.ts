export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
};

export type Post = {
  id: string;
  user_id: string;
  image_url: string | null;
  caption: string | null;
  created_at: string;
  profile?: Profile;
  like_count?: number;
  comment_count?: number;
  liked_by_me?: boolean;
};

export type Reel = {
  id: string;
  user_id: string;
  video_url: string;
  caption: string | null;
  created_at: string;
  profile?: Profile;
};

export type Follow = {
  follower_id: string;
  followee_id: string;
  created_at: string;
};

export type Comment = {
  id: string;
  user_id: string;
  post_id: string;
  text: string;
  created_at: string;
  profile?: Profile;
};

export type Route =
  | { name: 'home' }
  | { name: 'explore' }
  | { name: 'reels' }
  | { name: 'profile'; userId: string };
