import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

type AuthState = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
};

type AuthContextValue = AuthState & {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    loading: true,
  });

  const loadProfile = async (userId: string): Promise<Profile | null> => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    return data as Profile | null;
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const session = data.session;
      if (session?.user) {
        loadProfile(session.user.id).then((profile) => {
          if (!mounted) return;
          setState({ session, user: session.user, profile, loading: false });
        });
      } else {
        setState({ session: null, user: null, profile: null, loading: false });
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          const profile = await loadProfile(session.user.id);
          if (!mounted) return;
          setState({ session, user: session.user, profile, loading: false });
        } else {
          if (!mounted) return;
          setState({ session: null, user: null, profile: null, loading: false });
        }
      })();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  };

  const signUp = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    const user = data.user;
    if (!user) return { error: 'Account creation failed.' };
    const { error: profileError } = await supabase.from('profiles').insert({
      id: user.id,
      username,
    });
    if (profileError) return { error: profileError.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setState({ session: null, user: null, profile: null, loading: false });
  };

  const refreshProfile = async () => {
    if (!state.user) return;
    const profile = await loadProfile(state.user.id);
    setState((s) => ({ ...s, profile }));
  };

  return (
    <AuthContext.Provider
      value={{ ...state, signIn, signUp, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
