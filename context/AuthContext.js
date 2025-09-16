'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load token and user from localStorage on mount
    const savedToken = localStorage.getItem('swifttrack_token');
    const savedUser = localStorage.getItem('swifttrack_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.login(email, password);
      const { token: newToken, user: userData } = response;
      
      setToken(newToken);
      setUser(userData);
      
      localStorage.setItem('swifttrack_token', newToken);
      localStorage.setItem('swifttrack_user', JSON.stringify(userData));
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (name, email, password, role = 'client') => {
    try {
      const response = await apiClient.register(name, email, password, role);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('swifttrack_token');
    localStorage.removeItem('swifttrack_user');
  };

  const isClient = user?.role === 'client';
  const isDriver = user?.role === 'driver';
  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    loading,
    isClient,
    isDriver,
    isAuthenticated,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};