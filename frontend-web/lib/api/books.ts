import apiClient from './client';
import type { Book, PaginatedResponse, ApiResponse } from '@/lib/types/api';

interface BookFilters {
  search?: string;
  category_id?: number;
  author_id?: number;
  publisher_id?: number;
  is_featured?: boolean;
  is_available?: boolean;
  page?: number;
  per_page?: number;
}

/**
 * Books API endpoints
 */
export const booksApi = {
  /**
   * Get all books with pagination and filters
   */
  getAll: async (filters?: BookFilters): Promise<PaginatedResponse<Book>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Book>>>('/books', {
      params: filters,
    });
    return response.data.data;
  },

  /**
   * Get single book by ID
   */
  getById: async (id: number): Promise<Book> => {
    const response = await apiClient.get<ApiResponse<Book>>(`/books/${id}`);
    return response.data.data;
  },

  /**
   * Get featured books
   */
  getFeatured: async (): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>('/books/featured');
    return response.data.data;
  },

  /**
   * Search books
   */
  search: async (query: string): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>('/books/search', {
      params: { q: query },
    });
    return response.data.data;
  },

  /**
   * Check book availability
   */
  checkAvailability: async (id: number): Promise<{
    is_available: boolean;
    available_copies: number;
    total_copies: number;
    next_available_date?: string;
  }> => {
    const response = await apiClient.get(`/books/${id}/availability`);
    return response.data.data;
  },

  /**
   * Create new book (admin/librarian only)
   */
  create: async (data: Partial<Book> | FormData): Promise<Book> => {
    const response = await apiClient.post<ApiResponse<Book>>('/books', data);
    return response.data.data;
  },

  /**
   * Update book (admin/librarian only)
   */
  update: async (id: number, data: Partial<Book> | FormData): Promise<Book> => {
    // If data is FormData, use POST with _method override for Laravel
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      const response = await apiClient.post<ApiResponse<Book>>(`/books/${id}`, data);
      return response.data.data;
    }
    
    // Regular JSON update
    const response = await apiClient.put<ApiResponse<Book>>(`/books/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete book (admin only)
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/books/${id}`);
  },
};
