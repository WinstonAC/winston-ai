import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { randomBytes } from 'crypto';

// Generate a random CSRF token
const generateToken = () => randomBytes(32).toString('hex');

// Validate CSRF token
const validateToken = (token: string, cookieToken: string) => {
  return token && cookieToken && token === cookieToken;
};

export function csrfMiddleware(req: NextRequest) {
  // Skip CSRF for GET requests and static files
  if (req.method === 'GET' || req.nextUrl.pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // Get CSRF token from header and cookie
  const csrfToken = req.headers.get('x-csrf-token');
  const csrfCookie = req.cookies.get('csrf-token')?.value;

  // Validate CSRF token
  if (!validateToken(csrfToken || '', csrfCookie || '')) {
    return new NextResponse(
      JSON.stringify({ error: 'Invalid CSRF token' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Generate new CSRF token for next request
  const newToken = generateToken();
  const response = NextResponse.next();
  
  // Set new CSRF token in cookie
  response.cookies.set('csrf-token', newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  return response;
} 