import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  balance: number;
  email: string;
  avatar?: string;
}

interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, username: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateBalance: (amount: number) => void;
  refreshProfile: () => Promise<void>;
}

/** Walkthrough accounts kept available for client demonstrations. */
export const WALKTHROUGH_ACCOUNTS = [
  { label: 'Player', email: 'user1@pirateparlays.com', password: 'PirateParlays1!', username: 'user1' },
  { label: 'Admin', email: 'admin@pirateparlays.com', password: 'PirateParlays1!', username: 'admin1' },
];

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const loadingProfileFor = useRef<string | null>(null);

  const loadProfile = useCallback(async (uid: string, email: string) => {
    loadingProfileFor.current = uid;
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from('profiles').select('username, display_name, balance').eq('id', uid).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', uid),
    ]);
    if (loadingProfileFor.current !== uid) return;
    const role: UserRole = roles?.some(r => r.role === 'admin') ? 'admin' : 'user';
    setUser({
      id: uid,
      email,
      username: profile?.username ?? email.split('@')[0],
      balance: Number(profile?.balance ?? 0),
      role,
    });
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        // defer the profile read out of the auth callback
        setTimeout(() => {
          void loadProfile(nextSession.user.id, nextSession.user.email ?? '').finally(() => setLoading(false));
        }, 0);
      } else {
        loadingProfileFor.current = null;
        setUser(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        void loadProfile(data.session.user.id, data.session.user.email ?? '').finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, []);

  const signUp = useCallback(async (email: string, password: string, username: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { username: username.trim(), display_name: username.trim() },
      },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user) await loadProfile(session.user.id, session.user.email ?? '');
  }, [session, loadProfile]);

  const updateBalance = useCallback((amount: number) => {
    setUser(prev => {
      if (!prev) return prev;
      const next = Math.max(0, prev.balance + amount);
      void supabase.from('profiles').update({ balance: next }).eq('id', prev.id);
      return { ...prev, balance: next };
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, logout, updateBalance, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
