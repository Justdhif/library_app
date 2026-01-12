'use server';

import { getCookie, setCookie, clearAuthCookies } from './cookies';
import { COOKIE_NAMES } from './constants';
import apiClient from '@/lib/api/client';
import type { User, LoginRequest, ApiResponse } from '@/lib/types/api';

/**
 * Login user and set auth cookies
 */
export async function loginAction(credentials: LoginRequest): Promise<void> {
  const response = await apiClient.post<ApiResponse<{ token: string; user: User }>>(
    '/auth/login',
    credentials
  );
  
  const { token, user } = response.data.data;
  
  console.log('[LoginAction] User logged in:', { 
    userId: user.id, 
    role: user.profile?.role,
    email: user.email 
  });
  
  // Set encrypted cookies
  await setCookie(COOKIE_NAMES.AUTH_TOKEN, token, true);
  await setCookie(COOKIE_NAMES.USER_DATA, JSON.stringify(user), true);
  await setCookie(COOKIE_NAMES.USER_ROLE, user.profile?.role || 'member', false);
  
  console.log('[LoginAction] Cookies set successfully');
}

/**
 * Logout user and clear all cookies
 */
export async function logoutAction(): Promise<void> {
  try {
    // Call backend logout endpoint
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('Backend logout error:', error);
  } finally {
    // Always clear cookies regardless of backend response
    await clearAuthCookies();
  }
}

/**
 * Get current user from cookies
 */
export async function getCurrentUserAction(): Promise<User | null> {
  try {
    const userDataStr = await getCookie(COOKIE_NAMES.USER_DATA, true);
    if (!userDataStr) {
      return null;
    }
    
    return JSON.parse(userDataStr) as User;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get auth token from cookies
 */
export async function getAuthTokenAction(): Promise<string | null> {
  return await getCookie(COOKIE_NAMES.AUTH_TOKEN, true);
}

/**
 * Get auth token for client-side API calls (without encryption)
 * This returns the decrypted token that can be used in Authorization headers
 */
export async function getDecryptedTokenAction(): Promise<string | null> {
  try {
    const token = await getCookie(COOKIE_NAMES.AUTH_TOKEN, true);
    console.log('[GetDecryptedToken] Token retrieved:', token ? 'Yes (length: ' + token.length + ')' : 'No');
    return token;
  } catch (error) {
    console.error('[GetDecryptedToken] Error getting decrypted token:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticatedAction(): Promise<boolean> {
  const token = await getAuthTokenAction();
  return !!token;
}

/**
 * Refresh user data from backend and update cookies
 */
export async function refreshUserAction(): Promise<User> {
  const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
  const user = response.data.data.user || response.data.data;
  
  // Update user data cookie
  await setCookie(COOKIE_NAMES.USER_DATA, JSON.stringify(user), true);
  await setCookie(COOKIE_NAMES.USER_ROLE, user.profile?.role || 'member', false);
  
  return user;
}
