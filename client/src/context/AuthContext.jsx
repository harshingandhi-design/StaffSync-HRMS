import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('staffsync_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('staffsync_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api
        .get('/auth/me')
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem('staffsync_user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('staffsync_token', newToken);
    localStorage.setItem('staffsync_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token: newToken, user: userProfile } = res.data;
    localStorage.setItem('staffsync_token', newToken);
    localStorage.setItem('staffsync_user', JSON.stringify(userProfile));
    setToken(newToken);
    setUser(userProfile);
    return userProfile;
  };

  const logout = () => {
    localStorage.removeItem('staffsync_token');
    localStorage.removeItem('staffsync_user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data);
    setUser(res.data.user);
    localStorage.setItem('staffsync_user', JSON.stringify(res.data.user));
    return res.data;
  };

  const isHR = user?.role === 'hr' || user?.role === 'admin';
  const isManager = user?.role === 'manager' || user?.role === 'hr' || user?.role === 'admin';
  const isEmployee = user?.role === 'employee';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isHR,
        isManager,
        isEmployee,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
