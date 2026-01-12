import apiClient from './client';
import type { Author } from '../types/api';

export interface AuthorsResponse {
  data: Author[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const authorsApi = {
  getAll: async (params?: { is_active?: boolean; per_page?: number; page?: number; search?: string }): Promise<AuthorsResponse> => {
    const response = await apiClient.get('/authors', { params });
    return response.data.data; // Backend wraps paginated data in { success, message, data: { ...pagination } }
  },

  getById: async (id: number): Promise<Author> => {
    const response = await apiClient.get(`/authors/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<Author> | FormData): Promise<Author> => {
    const response = await apiClient.post('/authors', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data.data;
  },

  update: async (id: number, data: Partial<Author> | FormData): Promise<Author> => {
    const response = await apiClient.post(`/authors/${id}`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
      params: data instanceof FormData ? { _method: 'PUT' } : {},
    });
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/authors/${id}`);
  },
};
