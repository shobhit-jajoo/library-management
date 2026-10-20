import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../api/auth.api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('lms_access_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      const res = await authApi.me();
      // Handle both res.data (direct User) and res.data.user (nested object) defensively
      const fetchedUser = (res.data as any)?.user || (res.data?.id ? res.data : null);

      if (res.success && fetchedUser) {
        setUser(fetchedUser);
      } else {
        logoutLocal();
      }
    } catch {
      logoutLocal();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (identifier: string, pass: string) => {
    const res = await authApi.login(identifier, pass);
    if (res.success && res.data) {
      const accessToken = res.data.accessToken;
      // 1. Immediately store token in localStorage so subsequent requests (and interceptors) have it
      localStorage.setItem('lms_access_token', accessToken);
      // 2. Set user and token synchronously in React state
      setUser(res.data.user);
      setToken(accessToken);
      setIsLoading(false);
    } else {
      throw new Error(res.error?.message || 'Login failed');
    }
  };

  const logoutLocal = () => {
    localStorage.removeItem('lms_access_token');
    setToken(null);
    setUser(null);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore API logout error and clear local state anyway
    } finally {
      logoutLocal();
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
