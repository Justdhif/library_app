import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds
  // Don't use withCredentials: true as it can cause CORS issues
  // We'll send auth token via Authorization header instead
});

// Request interceptor - Add auth token to headers
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // For client-side requests, get token from server action
    if (typeof window !== 'undefined') {
      try {
        // Dynamically import to avoid circular dependencies
        const { getDecryptedTokenAction } = await import('@/lib/auth/actions');
        const token = await getDecryptedTokenAction();
        
        console.log('[API Client] Request to:', config.url, 'Token:', token ? 'Present' : 'Missing');
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.warn('[API Client] No token found for authenticated request');
        }
      } catch (error) {
        console.error('[API Client] Error getting token for request:', error);
      }
    }
    
    // If sending FormData, remove Content-Type header to let browser set it automatically with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const errorDetails = {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      message: error.message,
      data: error.response?.data,
    };
    
    console.error('[API Client] Response error:', errorDetails);
    
    if (error.response?.status === 401) {
      console.warn('[API Client] 401 Unauthorized - Token expired or invalid, logging out...');
      
      // Only auto-logout on client-side
      if (typeof window !== 'undefined') {
        try {
          // Import dynamically to avoid circular dependencies
          const { logoutAction } = await import('@/lib/auth/actions');
          await logoutAction();
          
          // Redirect to login
          window.location.href = '/login';
        } catch (logoutError) {
          console.error('[API Client] Error during auto-logout:', logoutError);
          // Force redirect anyway
          window.location.href = '/login';
        }
      }
    }
    
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      console.error('[API Client] Network error - Check if backend is running and CORS is configured');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
