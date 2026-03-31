import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('casino_token');
    if (token) {
      api.getMe()
        .then(data => setUser(data.user))
        .catch(() => localStorage.removeItem('casino_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const data = await api.login(username, password);
    localStorage.setItem('casino_token', data.token);
    setUser(data.user);
    return data;
  };

  const register = async (username, password, display_name) => {
    const data = await api.register(username, password, display_name);
    localStorage.setItem('casino_token', data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('casino_token');
    setUser(null);
  };

  const refreshBalance = async () => {
    try {
      const data = await api.getBalance();
      setUser(prev => prev ? { ...prev, balance: data.balance } : null);
    } catch (e) { /* ignore */ }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshBalance }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
