import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { Sparkles, Loader2 } from 'lucide-react';

export default function Signup() {
  const { signUp } = useAuth();
  const { navigate, setAuthView } = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email.trim(), password, username.trim());
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    navigate({ name: 'home' });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 sm:p-12 bg-white order-2 lg:order-1">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <Sparkles className="w-6 h-6 text-sky-500" />
            <span className="text-xl font-bold">SocialHub</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-gray-500">Join SocialHub and start sharing your story.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
                placeholder="yourname"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
                placeholder="At least 6 characters"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-semibold transition flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating account…' : 'Sign up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <button onClick={() => setAuthView('login')} className="text-sky-600 font-semibold hover:underline">
              Sign in
            </button>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-emerald-400 via-cyan-500 to-sky-500 order-1 lg:order-2">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 70% 20%, white 0, transparent 40%), radial-gradient(circle at 30% 80%, white 0, transparent 35%)' }} />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2 justify-end">
            <span className="text-2xl font-bold tracking-tight">SocialHub</span>
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-5xl font-bold leading-tight">Start something new.</h1>
            <p className="mt-4 text-lg text-white/90 max-w-md">
              Your audience is waiting. Share posts and reels, follow creators, and build your community.
            </p>
          </div>
          <p className="text-white/70 text-sm">© 2026 SocialHub. Crafted for connection.</p>
        </div>
      </div>
    </div>
  );
}
