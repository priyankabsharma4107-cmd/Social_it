import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Route } from '../types';

type AuthView = 'login' | 'signup';

type RouterContextValue = {
  route: Route;
  navigate: (route: Route) => void;
  authView: AuthView;
  setAuthView: (v: AuthView) => void;
};

const RouterContext = createContext<RouterContextValue | undefined>(undefined);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const [authView, setAuthView] = useState<AuthView>('login');
  const navigate = (r: Route) => {
    setRoute(r);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <RouterContext.Provider value={{ route, navigate, authView, setAuthView }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}
