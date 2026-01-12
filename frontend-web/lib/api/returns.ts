import apiClient from './client';
import type { PaginatedResponse, ApiResponse } from '@/lib/types/api';

export interface BookReturn {
  id: number;
  borrowing_id: number;
  user_id: number;
  book_copy_id: number;
  return_date: string;
  condition: 'new' | 'good' | 'fair' | 'poor' | 'damaged';
  return_notes?: string;
  fine_amount: number;
  fine_paid: boolean;
  fine_paid_date?: string;
  fine_waived: boolean;
  fine_waived_by?: number;
  fine_waive_reason?: string;
  returned_by?: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  borrowing?: {
    id: number;
    user: {
      id: number;
      username: string;
      email: string;
      profile: {
        full_name: string;
        avatar: string | null;
      };
    };
    book_copy: {
      id: number;
      book: {
        id: number;
        title: string;
        isbn: string;
        cover_image: string | null;
      };
      copy_number: number;
      barcode: string;
    };
    borrowed_date: string;
    due_date: string;
  };
  returned_by_user?: {
    id: number;
    username: string;
    profile: {
      full_name: string;
    };
  };
}

interface ReturnFilters {
  status?: 'pending' | 'approved' | 'rejected';
  user_id?: number;
  page?: number;
  per_page?: number;
  search?: string;
}

interface ProcessReturnData {
  borrowing_id: number;
  condition: 'new' | 'good' | 'fair' | 'poor' | 'damaged';
  return_notes?: string;
}

/**
 * Returns API endpoints
 */
export const returnsApi = {
  /**
   * Get all returns with filters
   */
  getAll: async (filters?: ReturnFilters): Promise<PaginatedResponse<BookReturn>> => {
    const response = await apiClient.get<PaginatedResponse<BookReturn>>('/returns', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get single return by ID
   */
  getById: async (id: number): Promise<BookReturn> => {
    const response = await apiClient.get<ApiResponse<BookReturn>>(`/returns/${id}`);
    return response.data.data;
  },

  /**
   * Process a book return
   */
  create: async (data: ProcessReturnData): Promise<BookReturn> => {
    const response = await apiClient.post<ApiResponse<BookReturn>>('/returns', data);
    return response.data.data;
  },

  /**
   * Get return statistics
   */
  getStats: async (): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/returns/stats');
    return response.data.data;
  },

  /**
   * Pay fine for a return
   */
  payFine: async (id: number, data: { amount: number; payment_method: string; payment_reference?: string }): Promise<BookReturn> => {
    const response = await apiClient.post<ApiResponse<BookReturn>>(`/returns/${id}/pay-fine`, data);
    return response.data.data;
  },

  /**
   * Waive fine for a return
   */
  waiveFine: async (id: number, data: { reason: string }): Promise<BookReturn> => {
    const response = await apiClient.post<ApiResponse<BookReturn>>(`/returns/${id}/waive-fine`, data);
    return response.data.data;
  },

  /**
   * Approve return (if needed)
   */
  approve: async (id: number): Promise<BookReturn> => {
    const response = await apiClient.post<ApiResponse<BookReturn>>(`/returns/${id}/approve`);
    return response.data.data;
  },

  /**
   * Reject return
   */
  reject: async (id: number, data: { reason: string }): Promise<BookReturn> => {
    const response = await apiClient.post<ApiResponse<BookReturn>>(`/returns/${id}/reject`, data);
    return response.data.data;
  },

  /**
   * Search returns
   */
  search: async (query: string): Promise<PaginatedResponse<BookReturn>> => {
    const response = await apiClient.get<PaginatedResponse<BookReturn>>('/returns/search', {
      params: { query },
    });
    return response.data;
  },

  /**
   * Export returns data
   */
  export: async (filters?: ReturnFilters): Promise<Blob> => {
    const response = await apiClient.get('/returns/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
};
