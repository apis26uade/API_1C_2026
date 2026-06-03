import React, { createContext, useContext, useState, useCallback } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';

interface AuthUser {
  email: string;
  role: string;
  idUser?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('boho_token'));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('boho_user');
    return stored ? JSON.parse(stored) : null;
  });

  const persist = (token: string, user: AuthUser) => {
    localStorage.setItem('boho_token', token);
    localStorage.setItem('boho_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    persist(data.token, { email: data.email, role: data.role, idUser: data.idUser });
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await apiRegister(name, email, password);
    persist(data.token, { email: data.email, role: data.role, idUser: data.idUser });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('boho_token');
    localStorage.removeItem('boho_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token,
      isAdmin: user?.role === 'ROLE_ADMIN',
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
