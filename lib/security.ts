import { AppError } from './error';

// Rate limiting implementation
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  key: string,
  limit: number = 100, // requests
  windowMs: number = 60 * 1000 // 1 minute
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

// CSRF token management
let csrfToken: string | null = null;

export function getCsrfToken(): string {
  if (!csrfToken) {
    csrfToken = generateCsrfToken();
  }
  return csrfToken;
}

function generateCsrfToken(): string {
  const array = new Uint32Array(8);
  crypto.getRandomValues(array);
  return Array.from(array, dec => dec.toString(16).padStart(8, '0')).join('');
}

export function validateCsrfToken(token: string): boolean {
  return token === csrfToken;
}

// Input validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

export function sanitizeInput(input: string): string {
  return input.replace(/[<>]/g, '');
}

// API security middleware
export async function withSecurity(
  handler: Function,
  options: {
    requireCsrf?: boolean;
    rateLimit?: {
      key: string;
      limit?: number;
      windowMs?: number;
    };
  } = {}
) {
  return async (...args: any[]) => {
    try {
      // Check rate limit if specified
      if (options.rateLimit) {
        const { key, limit, windowMs } = options.rateLimit;
        if (!checkRateLimit(key, limit, windowMs)) {
          throw new AppError('Too many requests', 'rate_limit');
        }
      }

      // Check CSRF token if required
      if (options.requireCsrf) {
        const [req] = args;
        const token = req.headers['x-csrf-token'];
        if (!token || !validateCsrfToken(token)) {
          throw new AppError('Invalid CSRF token', 'authentication');
        }
      }

      return await handler(...args);
    } catch (error) {
      throw error;
    }
  };
} 