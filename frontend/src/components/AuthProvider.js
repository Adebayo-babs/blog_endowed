'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, TOKEN_KEY } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let token = null;
    try { token = localStorage.getItem(TOKEN_KEY); } catch {}
    if (!token) { setReady(true); return; }
    api('/auth/me')
      .then(({ user }) => setUser(user))
      .catch(() => { try { localStorage.removeItem(TOKEN_KEY); } catch {} })
      .finally(() => setReady(true));
  }, []);

  const finish = ({ token, user }) => {
    try { localStorage.setItem(TOKEN_KEY, token); } catch {}
    setUser(user);
    return user;
  };

  const login = useCallback(async (email, password) =>
    finish(await api('/auth/login', { method: 'POST', body: { email, password } })), []);

  const register = useCallback(async (name, email, password) =>
    finish(await api('/auth/register', { method: 'POST', body: { name, email, password } })), []);

  const logout = useCallback(() => {
    try { localStorage.removeItem(TOKEN_KEY); } catch {}
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
