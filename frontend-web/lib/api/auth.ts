import apiClient from './client';
import type {
  RegisterRequest,
  AuthResponse,
  User,
  ApiResponse,
} from '@/lib/types/api';

/**
 * Authentication API endpoints
 * 
 * NOTE: Login and logout should use server actions from @/lib/auth/actions
 * This file only contains direct API calls without cookie management
 */
export const authApi = {
  /**
   * Register new user (without automatic cookie setting)
   * Use this for registration flow, then call loginAction separately
   * @param data - Registration data
   * @returns Authentication response with token
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      data
    );
    
    return response.data.data;
  },

  /**
   * Get current authenticated user from backend
   * @returns Current user data
   */
  me: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<{ user?: User } & User>>('/auth/me');
    
    // Check if response has nested user property or direct user data
    const userData = response.data.data.user || response.data.data;
    
    return userData;
  },

  /**
   * Change password
   * @param data - Current and new password
   */
  changePassword: async (data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<void> => {
    await apiClient.post('/auth/change-password', data);
  },
};
