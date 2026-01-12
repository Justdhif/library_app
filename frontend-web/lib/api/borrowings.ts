import apiClient from './client';
import type { Borrowing, PaginatedResponse, ApiResponse } from '@/lib/types/api';

interface BorrowingFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'borrowed' | 'returned' | 'overdue' | 'cancelled';
  user_id?: number;
  page?: number;
  per_page?: number;
}

/**
 * Borrowings API endpoints
 */
export const borrowingsApi = {
  /**
   * Get all borrowings with filters
   */
  getAll: async (filters?: BorrowingFilters): Promise<PaginatedResponse<Borrowing>> => {
    const response = await apiClient.get<PaginatedResponse<Borrowing>>('/borrowings', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get single borrowing by ID
   */
  getById: async (id: number): Promise<Borrowing> => {
    const response = await apiClient.get<ApiResponse<Borrowing>>(`/borrowings/${id}`);
    return response.data.data;
  },

  /**
   * Get my borrowings (authenticated user)
   */
  getMyBorrowings: async (): Promise<PaginatedResponse<Borrowing>> => {
    const response = await apiClient.get<PaginatedResponse<Borrowing>>('/borrowings/my-borrowings');
    return response.data;
  },

  /**
   * Get overdue borrowings
   */
  getOverdue: async (): Promise<PaginatedResponse<Borrowing>> => {
    const response = await apiClient.get<PaginatedResponse<Borrowing>>('/borrowings/overdue');
    return response.data;
  },

  /**
   * Create new borrowing request
   */
  create: async (data: { book_copy_id: number; notes?: string }): Promise<Borrowing> => {
    const response = await apiClient.post<ApiResponse<Borrowing>>('/borrowings', data);
    return response.data.data;
  },

  /**
   * Approve borrowing (librarian only)
   */
  approve: async (id: number): Promise<Borrowing> => {
    const response = await apiClient.post<ApiResponse<Borrowing>>(`/borrowings/${id}/approve`);
    return response.data.data;
  },

  /**
   * Return book
   */
  return: async (id: number, data: { condition: string; return_notes?: string }): Promise<Borrowing> => {
    const response = await apiClient.post<ApiResponse<Borrowing>>(`/borrowings/${id}/return`, data);
    return response.data.data;
  },

  /**
   * Renew borrowing
   */
  renew: async (id: number): Promise<Borrowing> => {
    const response = await apiClient.post<ApiResponse<Borrowing>>(`/borrowings/${id}/renew`);
    return response.data.data;
  },

  /**
   * Cancel borrowing
   */
  cancel: async (id: number): Promise<void> => {
    await apiClient.delete(`/borrowings/${id}/cancel`);
  },
};
