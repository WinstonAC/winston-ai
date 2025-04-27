import toast from 'react-hot-toast';
import { AppError, handleError, showErrorToast } from './error';
import { getCsrfToken, withSecurity } from './security';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

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
  enableCache?: boolean;
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
  userId?: string;
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
    enableCache = true,
    cacheKey,
    pagination,
    retry = true,
    maxRetries = 3,
    retryDelay = 1000,
    requireCsrf = true,
    rateLimit = true,
    userId
  } = options;

  // Add CSRF token to headers if required
  if (requireCsrf) {
    headers['x-csrf-token'] = getCsrfToken();
  }

  // Create rate limit key based on endpoint and user
  const rateLimitKey = rateLimit ? `${endpoint}:${userId || 'anonymous'}` : undefined;

  // Create the handler function
  const handler = async () => {
    // Check cache for GET requests
    if (method === 'GET' && enableCache) {
      const key = cacheKey || endpoint;
      const cached = cache.get(key);
      if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minutes default
        return cached.data as T;
      }
    }

    const response = await fetchWithRetry(
      endpoint,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: body ? JSON.stringify(body) : undefined
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new AppError(error.message || 'API request failed', error.code || 'api_error');
    }

    const data = await response.json();

    // Cache GET responses
    if (method === 'GET' && enableCache) {
      const key = cacheKey || endpoint;
      cache.set(key, {
        data,
        timestamp: Date.now()
      });
    }

    return data as T;
  };

  // Wrap the handler with security middleware
  const secureHandler = await withSecurity(
    handler,
    {
      requireCsrf,
      rateLimit: rateLimitKey ? {
        key: rateLimitKey,
        limit: 100,
        windowMs: 60 * 1000
      } : undefined
    }
  );

  return secureHandler();
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
async function fetchWithRetry(
  endpoint: string,
  options: RequestInit
): Promise<Response> {
  let lastError;
  const maxRetries = 3;
  const retryDelay = 1000;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      if (response.ok) return response;
      lastError = await response.json();
    } catch (error) {
      lastError = error;
    }
    
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
    }
  }
  
  throw new AppError(
    lastError?.message || 'Request failed after retries',
    lastError?.code || 'api_error'
  );
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