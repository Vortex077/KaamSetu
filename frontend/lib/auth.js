'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('kaamsetu_token');
    const storedUser = localStorage.getItem('kaamsetu_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const loginUser = (userData, jwtToken) => {
    localStorage.setItem('kaamsetu_token', jwtToken);
    localStorage.setItem('kaamsetu_user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('kaamsetu_token');
    localStorage.removeItem('kaamsetu_user');
    setToken(null);
    setUser(null);
    router.push('/auth/login');
  };

  const isAuthenticated = !!token;
  const isWorker = user?.role === 'worker';
  const isHirer = user?.role === 'hirer';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{ user, token, loading, isAuthenticated, isWorker, isHirer, isAdmin, loginUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
