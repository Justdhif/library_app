/**
 * Centralized API exports
 * Import dari file ini untuk menggunakan semua API endpoints
 * 
 * @example
 * import { authApi, booksApi } from '@/lib/api';
 * 
 * // Login
 * const auth = await authApi.login({ email, password });
 * 
 * // Get books
 * const books = await booksApi.getAll({ page: 1 });
 */

export { default as apiClient } from './client';
export { authApi } from './auth';
export { booksApi } from './books';
export { borrowingsApi } from './borrowings';
export { usersApi } from './users';
export { profileApi } from './profile';
export { categoriesApi } from './categories';

// Re-export types
export type * from '@/lib/types/api';
