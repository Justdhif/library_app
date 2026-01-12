'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  loginAction,
  logoutAction,
  getCurrentUserAction,
  refreshUserAction,
  isAuthenticatedAction,
} from './actions';
import { getDashboardPath } from './utils';
import type { User, LoginRequest } from '@/lib/types/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user data on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await isAuthenticatedAction();
        if (!isAuth) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        const userData = await getCurrentUserAction();
        setUser(userData);
      } catch (error) {
        console.error('Error loading user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        console.log('[AuthContext] Starting login...');
        
        // Call server action to login and set cookies
        await loginAction(credentials);
        console.log('[AuthContext] Login action completed');

        // Get user data from cookies that were just set
        const userData = await getCurrentUserAction();
        if (!userData) {
          throw new Error('Failed to get user data after login');
        }
        
        console.log('[AuthContext] User data retrieved:', { 
          userId: userData.id, 
          role: userData.profile?.role 
        });
        
        setUser(userData);

        console.log('[AuthContext] Redirecting to /dashboard...');
        
        // Small delay to ensure cookies are fully set in browser
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Use window.location for hard navigation to ensure middleware processes the request with new cookies
        window.location.href = '/dashboard';
      } catch (error) {
        console.error('[AuthContext] Login error:', error);
        setUser(null);
        throw error;
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      // Call server action to logout and clear cookies
      await logoutAction();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      router.push('/login');
      router.refresh();
    }
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await refreshUserAction();
      setUser(userData);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
