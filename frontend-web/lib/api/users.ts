import apiClient from './client';
import type { User, PaginatedResponse, ApiResponse } from '@/lib/types/api';

interface UserFilters {
  role?: 'admin' | 'librarian' | 'member';
  status?: 'active' | 'inactive' | 'suspended';
  search?: string;
  page?: number;
  per_page?: number;
}

/**
 * Users API endpoints
 */
export const usersApi = {
  /**
   * Get all users (admin only)
   */
  getAll: async (filters?: UserFilters): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>('/users', {
      params: filters,
    });
    // Backend returns nested structure: {success, message, data: {pagination}}
    return response.data.data;
  },

  /**
   * Get user by ID
   */
  getById: async (id: number): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  },

  /**
   * Create new user (admin only)
   */
  create: async (data: Partial<User> | FormData): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>('/users', data, {
      headers: data instanceof FormData ? {
        'Content-Type': 'multipart/form-data',
      } : undefined,
    });
    return response.data.data;
  },

  /**
   * Update user (admin only)
   */
  update: async (id: number, data: Partial<User> | FormData): Promise<User> => {
    // Use POST with _method for file upload support
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      const response = await apiClient.post<ApiResponse<User>>(`/users/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    }
    
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data.data;
  },

  /**
   * Update user status (admin only)
   */
  updateStatus: async (id: number, status: 'active' | 'inactive' | 'suspended'): Promise<User> => {
    const response = await apiClient.patch<ApiResponse<User>>(`/users/${id}/status`, { status });
    return response.data.data;
  },

  /**
   * Delete user (admin only)
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  /**
   * Get user borrowing history
   */
  getHistory: async (id: number): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(`/users/${id}/history`);
    return response.data.data;
  },

  /**
   * Get user statistics
   */
  getStatistics: async (id: number): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(`/users/${id}/statistics`);
    return response.data.data;
  },
};
