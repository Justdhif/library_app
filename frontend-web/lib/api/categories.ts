import apiClient from './client';
import type { Category, PaginatedResponse, ApiResponse } from '@/lib/types/api';

interface CategoryFilters {
  search?: string;
  parent_id?: number;
  is_active?: boolean;
  page?: number;
  per_page?: number;
}

/**
 * Categories API endpoints
 */
export const categoriesApi = {
  /**
   * Get all categories with pagination and filters
   */
  getAll: async (filters?: CategoryFilters): Promise<PaginatedResponse<Category>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Category>>>('/categories', {
      params: filters,
    });
    return response.data.data;
  },

  /**
   * Get category tree (hierarchical structure)
   */
  getTree: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories/tree');
    return response.data.data;
  },

  /**
   * Get single category by ID
   */
  getById: async (id: number): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data.data;
  },

  /**
   * Create new category (admin/librarian only)
   */
  create: async (data: Partial<Category>): Promise<Category> => {
    const response = await apiClient.post<ApiResponse<Category>>('/categories', data);
    return response.data.data;
  },

  /**
   * Update category (admin/librarian only)
   */
  update: async (id: number, data: Partial<Category>): Promise<Category> => {
    const response = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete category (admin only)
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
