import apiClient from './client';
import type { Publisher, PaginatedResponse, ApiResponse } from '@/lib/types/api';

interface PublisherFilters {
  search?: string;
  is_active?: boolean;
  page?: number;
  per_page?: number;
}

/**
 * Publishers API endpoints
 */
export const publishersApi = {
  /**
   * Get all publishers with pagination and filters
   */
  getAll: async (filters?: PublisherFilters): Promise<PaginatedResponse<Publisher>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Publisher>>>('/publishers', {
      params: filters,
    });
    return response.data.data;
  },

  /**
   * Get single publisher by ID
   */
  getById: async (id: number): Promise<Publisher> => {
    const response = await apiClient.get<ApiResponse<Publisher>>(`/publishers/${id}`);
    return response.data.data;
  },

  /**
   * Create new publisher (admin/librarian only)
   */
  create: async (data: Partial<Publisher>): Promise<Publisher> => {
    const response = await apiClient.post<ApiResponse<Publisher>>('/publishers', data);
    return response.data.data;
  },

  /**
   * Update publisher (admin/librarian only)
   */
  update: async (id: number, data: Partial<Publisher>): Promise<Publisher> => {
    const response = await apiClient.put<ApiResponse<Publisher>>(`/publishers/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete publisher (admin only)
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/publishers/${id}`);
  },
};
