import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Role = 'volunteer' | 'organizer' | null;

interface AuthContextType {
  role: Role;
  userId: string | null;
  login: (role: 'volunteer' | 'organizer') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(() => {
    const stored = localStorage.getItem('spai_role');
    return (stored === 'volunteer' || stored === 'organizer') ? stored : null;
  });

  const userId = role === 'volunteer' ? 'v1' : role === 'organizer' ? 'org1' : null;

  const login = (r: 'volunteer' | 'organizer') => {
    localStorage.setItem('spai_role', r);
    setRole(r);
  };

  const logout = () => {
    localStorage.removeItem('spai_role');
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ role, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
