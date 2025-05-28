module.exports = {
  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'https://app.winston-ai.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400
  },

  // Rate Limiting
  rateLimit: {
    windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX || 100,
    message: 'Too many requests, please try again later.'
  },

  // Security Headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.winston-ai.com;
      style-src 'self' 'unsafe-inline' https://cdn.winston-ai.com;
      img-src 'self' data: https://cdn.winston-ai.com;
      font-src 'self' https://cdn.winston-ai.com;
      connect-src 'self' https://api.winston-ai.com;
      frame-ancestors 'none';
      form-action 'self';
    `.replace(/\s+/g, ' ').trim(),
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  },

  // Session Security
  session: {
    secret: process.env.NEXTAUTH_SECRET,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    }
  },

  // Password Policy
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAttempts: 5,
    lockoutDuration: 30 * 60 * 1000 // 30 minutes
  },

  // API Security
  api: {
    keyHeader: 'X-API-Key',
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 100
    },
    allowedOrigins: [
      'https://app.winston-ai.com',
      'https://staging.winston-ai.com'
    ]
  },

  // File Upload Security
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/csv'
    ],
    scanForMalware: true
  },

  // Logging
  logging: {
    level: 'info',
    format: 'json',
    exclude: [
      '/api/health',
      '/_next/static',
      '/favicon.ico'
    ]
  },

  // Monitoring
  monitoring: {
    enabled: true,
    providers: ['sentry', 'newrelic'],
    alertThresholds: {
      errorRate: 0.01,
      responseTime: 1000,
      cpuUsage: 80,
      memoryUsage: 80
    }
  },

  auth: {
    providers: ['supabase'],
    session: {
      strategy: 'jwt',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }
  }
}; 