import apiClient from './client';
import type { Profile, ApiResponse } from '@/lib/types/api';

interface UpdateProfileData {
  full_name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  avatar?: string;
  bio?: string;
}

/**
 * Profile API endpoints
 */
export const profileApi = {
  /**
   * Get current user profile
   */
  get: async (): Promise<Profile> => {
    const response = await apiClient.get<ApiResponse<Profile>>('/profile');
    return response.data.data;
  },

  /**
   * Update current user profile
   */
  update: async (data: UpdateProfileData): Promise<Profile> => {
    const response = await apiClient.put<ApiResponse<Profile>>('/profile', data);
    return response.data.data;
  },
};
