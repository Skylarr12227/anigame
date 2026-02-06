import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface AuthUser {
  id: string;
  username: string;
  displayName: string | null;
  currency: number;
  zooPoints: number;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null,
  });

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: data.error || 'Login failed' 
        }));
        return false;
      }
      
      localStorage.setItem('token', data.token);
      setState({
        user: data.user,
        token: data.token,
        loading: false,
        error: null,
      });
      
      return true;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Network error. Please try again.' 
      }));
      return false;
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: data.error || 'Registration failed' 
        }));
        return false;
      }
      
      localStorage.setItem('token', data.token);
      setState({
        user: data.user,
        token: data.token,
        loading: false,
        error: null,
      });
      
      return true;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Network error. Please try again.' 
      }));
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setState({
      user: null,
      token: null,
      loading: false,
      error: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: !!state.token,
  };
}
