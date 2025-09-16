import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import type { User, AuthContextType } from '../types/auth';
import { AuthContext } from './AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    if (token) {
      // You can add token validation here
      setUser({ id: '1', username: 'user', email: 'user@example.com' });
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const response = await axios.post('http://localhost:8081/api/auth/login', credentials);
      const { token, username, email } = response.data;
      
      localStorage.setItem('token', token);
      setUser({ id: '1', username, email }); // Create user object from response
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Login failed'
        : 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const register = async (userData: { username: string; email: string; password: string }) => {
    try {
      const response = await axios.post('http://localhost:8081/api/auth/register', userData);
      // Don't automatically log in after registration - just return success
      // User will be redirected to login page
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Registration failed'
        : 'Registration failed';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
