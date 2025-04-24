import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limit configuration
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
};

// Store for rate limit data
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimitMiddleware(req: NextRequest) {
  // Skip rate limiting for static files
  if (req.nextUrl.pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  const ip = req.ip || 'unknown';
  const now = Date.now();

  // Get or initialize rate limit data for this IP
  const rateLimitData = rateLimitStore.get(ip) || { count: 0, resetTime: now + RATE_LIMIT.windowMs };

  // Reset rate limit if window has passed
  if (now > rateLimitData.resetTime) {
    rateLimitData.count = 0;
    rateLimitData.resetTime = now + RATE_LIMIT.windowMs;
  }

  // Check if rate limit exceeded
  if (rateLimitData.count >= RATE_LIMIT.max) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests, please try again later' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((rateLimitData.resetTime - now) / 1000).toString(),
        },
      }
    );
  }

  // Increment request count
  rateLimitData.count++;
  rateLimitStore.set(ip, rateLimitData);

  // Add rate limit headers to response
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', RATE_LIMIT.max.toString());
  response.headers.set('X-RateLimit-Remaining', (RATE_LIMIT.max - rateLimitData.count).toString());
  response.headers.set('X-RateLimit-Reset', rateLimitData.resetTime.toString());

  return response;
} 