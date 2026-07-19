import { AuthProvider, useAuth } from './context/AuthContext';
import { RouterProvider, useRouter } from './context/RouterContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import HomeFeed from './pages/HomeFeed';
import Explore from './pages/Explore';
import Reels from './pages/Reels';
import ProfilePage from './pages/Profile';
import { Sparkles } from 'lucide-react';

function AppRoutes() {
  const { route } = useRouter();
  switch (route.name) {
    case 'home':
      return <HomeFeed />;
    case 'explore':
      return <Explore />;
    case 'reels':
      return <Reels />;
    case 'profile':
      return <ProfilePage userId={route.userId} />;
    default:
      return <HomeFeed />;
  }
}

function AuthGate() {
  const { loading, session } = useAuth();
  const { authView } = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center animate-pulse">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-400 text-sm">Loading SocialHub…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return authView === 'signup' ? <Signup /> : <Login />;
  }

  return (
    <Layout>
      <AppRoutes />
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AuthGate />
      </RouterProvider>
    </AuthProvider>
  );
}
