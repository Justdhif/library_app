import apiClient from './client';

export interface BookCopy {
  id: number;
  book_id: number;
  barcode: string;
  call_number: string;
  condition: 'new' | 'good' | 'fair' | 'poor';
  status: 'available' | 'borrowed' | 'damaged' | 'lost' | 'maintenance';
  location?: string;
  shelf_number?: string;
  acquisition_date?: string;
  acquisition_price?: number;
  notes?: string;
  times_borrowed: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBookCopyData {
  book_id: number;
  barcode: string;
  call_number: string;
  condition: 'new' | 'good' | 'fair' | 'poor';
  status: 'available' | 'borrowed' | 'damaged' | 'lost' | 'maintenance';
  location?: string;
  shelf_number?: string;
  acquisition_date?: string;
  acquisition_price?: number;
  notes?: string;
}

export interface UpdateBookCopyData extends Partial<CreateBookCopyData> {}

export const bookCopiesApi = {
  // Get all copies for a book
  getByBookId: async (bookId: number): Promise<BookCopy[]> => {
    const response = await apiClient.get(`/books/${bookId}/copies`);
    return response.data.data;
  },

  // Get single copy
  getById: async (bookId: number, copyId: number): Promise<BookCopy> => {
    const response = await apiClient.get(`/books/${bookId}/copies/${copyId}`);
    return response.data.data;
  },

  // Create new copy
  create: async (bookId: number, data: CreateBookCopyData): Promise<BookCopy> => {
    const response = await apiClient.post(`/books/${bookId}/copies`, data);
    return response.data.data;
  },

  // Update copy
  update: async (bookId: number, copyId: number, data: UpdateBookCopyData): Promise<BookCopy> => {
    const response = await apiClient.put(`/books/${bookId}/copies/${copyId}`, data);
    return response.data.data;
  },

  // Delete copy
  delete: async (bookId: number, copyId: number): Promise<void> => {
    await apiClient.delete(`/books/${bookId}/copies/${copyId}`);
  },

  // Get available copies
  getAvailable: async (bookId: number): Promise<BookCopy[]> => {
    const response = await apiClient.get(`/books/${bookId}/copies?status=available`);
    return response.data.data;
  },
};
