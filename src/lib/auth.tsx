import React, { createContext, useContext, useState, useCallback } from 'react';

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  balance: number;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateBalance: (amount: number) => void;
}

const ACCOUNTS: { username: string; password: string; user: User }[] = [
  {
    username: 'user1',
    password: '1234U',
    user: {
      id: 'u1',
      username: 'user1',
      role: 'user',
      balance: 1250.00,
      email: 'user1@pirateparlays.com',
    },
  },
  {
    username: 'admin1',
    password: '1234a',
    user: {
      id: 'a1',
      username: 'admin1',
      role: 'admin',
      balance: 0,
      email: 'admin@pirateparlays.com',
    },
  },
];

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((username: string, password: string) => {
    const found = ACCOUNTS.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    if (found) {
      setUser({ ...found.user });
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const updateBalance = useCallback((amount: number) => {
    setUser((prev) => prev ? { ...prev, balance: prev.balance + amount } : null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateBalance }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
