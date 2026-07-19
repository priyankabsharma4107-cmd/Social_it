import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { Home, Compass, Film, User, LogOut, Sparkles, Plus } from 'lucide-react';
import CreatePostModal from '../components/CreatePostModal';

type NavItem = {
  label: string;
  icon: typeof Home;
  route: () => import('../types').Route;
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const { route, navigate } = useRouter();
  const [showCreate, setShowCreate] = useState(false);

  const navItems: NavItem[] = [
    { label: 'Home', icon: Home, route: () => ({ name: 'home' }) },
    { label: 'Explore', icon: Compass, route: () => ({ name: 'explore' }) },
    { label: 'Reels', icon: Film, route: () => ({ name: 'reels' }) },
  ];

  const isActive = (name: string) => route.name === name;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 glass border-b border-gray-200/70">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate({ name: 'home' })}
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-sm group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 hidden sm:block">
              SocialHub
            </span>
          </button>

          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.label === 'Home' ? 'home' : item.label === 'Explore' ? 'explore' : 'reels');
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.route())}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition ${
                    active
                      ? 'bg-sky-50 text-sky-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden md:block">{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
              title="Create"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden md:block">Create</span>
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => profile && navigate({ name: 'profile', userId: profile.id })}
              className="flex items-center gap-2 group"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-transparent group-hover:ring-sky-400 transition"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-cyan-300 flex items-center justify-center text-white font-semibold ring-2 ring-transparent group-hover:ring-sky-400 transition">
                  {profile?.username?.[0]?.toUpperCase() ?? <User className="w-4 h-4" />}
                </div>
              )}
            </button>
            <button
              onClick={signOut}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>

      {showCreate && <CreatePostModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
