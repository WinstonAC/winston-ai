import { toast } from 'react-hot-toast';
import { AppError, handleError, showErrorToast } from './error';
import { getCsrfToken, withSecurity } from './security';

interface ApiResponse<T = any> {
  data?: T;
  error?: AppError;
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  cache?: boolean;
  cacheKey?: string;
  cacheDuration?: number; // in milliseconds
  pagination?: {
    page?: number;
    pageSize?: number;
  };
  retry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  requireCsrf?: boolean;
  rateLimit?: boolean;
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();

export async function fetchApi<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    cache = true,
    cacheKey,
    pagination,
    retry = true,
    maxRetries = 3,
    retryDelay = 1000,
    requireCsrf = true,
    rateLimit = true
  } = options;

  // Add CSRF token to headers if required
  if (requireCsrf) {
    headers['x-csrf-token'] = getCsrfToken();
  }

  // Create rate limit key based on endpoint and user
  const rateLimitKey = rateLimit ? `${endpoint}:${getCurrentUser()?.id || 'anonymous'}` : undefined;

  // Wrap the fetch operation with security middleware
  const fetchWithSecurity = withSecurity(
    async () => {
      // Check cache for GET requests
      if (method === 'GET' && cache) {
        const key = cacheKey || endpoint;
        const cached = cache.get(key);
        if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minutes default
          return cached.data as T;
        }
      }

      const response = await fetchWithRetry(
        `${API_BASE_URL}${endpoint}`,
        {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: body ? JSON.stringify(body) : undefined
        },
        retry,
        maxRetries,
        retryDelay
      );

      if (!response.ok) {
        const error = await response.json();
        throw new AppError(error.message || 'API request failed', error.code || 'api_error');
      }

      const data = await response.json();

      // Cache GET responses
      if (method === 'GET' && cache) {
        const key = cacheKey || endpoint;
        cache.set(key, {
          data,
          timestamp: Date.now()
        });
      }

      return data as T;
    },
    {
      requireCsrf,
      rateLimit: rateLimitKey ? {
        key: rateLimitKey,
        limit: 100,
        windowMs: 60 * 1000
      } : undefined
    }
  );

  return fetchWithSecurity();
}

// Clear cache for a specific key or all cache
export function clearCache(key?: string) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

// Retry mechanism for failed requests
export async function fetchWithRetry<T>(
  endpoint: string,
  options: ApiOptions = {},
  maxRetries = 3,
  retryDelay = 1000
): Promise<ApiResponse<T>> {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await fetchApi<T>(endpoint, options);
      if (!result.error) return result;
      lastError = result.error;
    } catch (error) {
      lastError = error;
    }
    
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
    }
  }
  
  return { error: handleError(lastError) };
}

export const api = {
  get: <T>(endpoint: string, options?: Omit<ApiOptions, 'method' | 'body'>) => 
    fetchApi<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T>(endpoint: string, body: any, options?: Omit<ApiOptions, 'method'>) => 
    fetchApi<T>(endpoint, { ...options, method: 'POST', body }),
  
  put: <T>(endpoint: string, body: any, options?: Omit<ApiOptions, 'method'>) => 
    fetchApi<T>(endpoint, { ...options, method: 'PUT', body }),
  
  delete: <T>(endpoint: string, options?: Omit<ApiOptions, 'method'>) => 
    fetchApi<T>(endpoint, { ...options, method: 'DELETE' }),
}; 