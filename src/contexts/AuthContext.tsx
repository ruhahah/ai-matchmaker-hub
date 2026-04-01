import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

type Role = 'volunteer' | 'organizer' | null;

interface AuthContextType {
  role: Role;
  userId: string | null;
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (role: 'volunteer' | 'organizer') => void;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role>(() => {
    const stored = localStorage.getItem('spai_role');
    return (stored === 'volunteer' || stored === 'organizer') ? stored : null;
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const userId = user?.id ?? (role === 'volunteer' ? 'v1' : role === 'organizer' ? 'org1' : null);

  const login = (r: 'volunteer' | 'organizer') => {
    localStorage.setItem('spai_role', r);
    setRole(r);
  };

  const logout = async () => {
    localStorage.removeItem('spai_role');
    setRole(null);
    await supabase.auth.signOut();
  };

  const signOut = logout;

  return (
    <AuthContext.Provider value={{ role, userId, user, session, loading, login, logout, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
