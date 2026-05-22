import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { setAuthToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('rbac_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('rbac_token') || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setAuthToken(token);
    if (token) {
      localStorage.setItem('rbac_token', token);
    } else {
      localStorage.removeItem('rbac_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('rbac_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('rbac_user');
    }
  }, [user]);

  useEffect(() => {
    const loadUser = async () => {
      if (!token || user) return;
      setIsLoading(true);
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [token, user]);

  const login = async (email, password) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      setToken(response.token);
      setUser(response.user);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await authService.register({ name, email, password });
      setToken(response.token);
      setUser(response.user);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // ignore failures; clear local state anyway
    }
    setUser(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({ user, token, login, register, logout, isLoading, error, setError }),
    [user, token, isLoading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
