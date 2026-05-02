import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { clearAuthStorage, getStoredSession, saveAuthStorage } from '../utils/storage';

type Session = {
  user: { id: string; fullName: string; email: string; role: string };
  token: string;
};

type AuthContextType = {
  session: Session | null;
  isAuthenticated: boolean;
  saveSession: (session: Session) => Promise<void>;
  clearSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    getStoredSession().then((stored) => {
      if (stored) setSession(stored);
    });
  }, []);

  const value = useMemo(() => ({
    session,
    isAuthenticated: !!session?.token,
    saveSession: async (nextSession: Session) => {
      await saveAuthStorage(nextSession);
      setSession(nextSession);
    },
    clearSession: async () => {
      await clearAuthStorage();
      setSession(null);
      router.replace('/(auth)/login');
    }
  }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
