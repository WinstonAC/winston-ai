module.exports = {
  environments: {
    development: {
      name: 'development',
      domain: 'localhost:3000',
      database: {
        host: process.env.DEV_DB_HOST,
        user: process.env.DEV_DB_USER,
        password: process.env.DEV_DB_PASSWORD,
        name: 'winston_ai_dev',
        pool: {
          min: 2,
          max: 10
        }
      },
      auth: {
        secret: process.env.DEV_NEXTAUTH_SECRET,
        jwtSecret: process.env.DEV_JWT_SECRET,
        sessionTimeout: 24 * 60 * 60, // 24 hours
        google: {
          clientId: process.env.DEV_GOOGLE_CLIENT_ID,
          clientSecret: process.env.DEV_GOOGLE_CLIENT_SECRET
        }
      },
      email: {
        host: 'smtp.sendgrid.net',
        port: 587,
        user: 'apikey',
        password: process.env.DEV_SENDGRID_API_KEY,
        from: 'dev@winston-ai.com',
        templates: {
          welcome: 'dev-welcome-template',
          resetPassword: 'dev-reset-password-template'
        }
      },
      monitoring: {
        sentryDsn: process.env.DEV_SENTRY_DSN,
        analyticsId: process.env.DEV_ANALYTICS_ID,
        logLevel: 'debug'
      },
      security: {
        corsOrigin: 'http://localhost:3000',
        rateLimit: {
          window: 15,
          max: 100
        },
        ssl: false
      },
      cache: {
        enabled: false,
        type: 'memory',
        ttl: 300 // 5 minutes
      },
      env: {
        NODE_ENV: 'development',
        NEXT_PUBLIC_SUPABASE_URL: process.env.DEV_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.DEV_SUPABASE_ANON_KEY,
      },
    },
    staging: {
      name: 'staging',
      domain: 'staging.winston-ai.com',
      database: {
        host: process.env.STAGING_DB_HOST,
        user: process.env.STAGING_DB_USER,
        password: process.env.STAGING_DB_PASSWORD,
        name: 'winston_ai_staging',
        pool: {
          min: 5,
          max: 20
        }
      },
      auth: {
        secret: process.env.STAGING_NEXTAUTH_SECRET,
        jwtSecret: process.env.STAGING_JWT_SECRET,
        sessionTimeout: 12 * 60 * 60, // 12 hours
        google: {
          clientId: process.env.STAGING_GOOGLE_CLIENT_ID,
          clientSecret: process.env.STAGING_GOOGLE_CLIENT_SECRET
        }
      },
      email: {
        host: 'smtp.sendgrid.net',
        port: 587,
        user: 'apikey',
        password: process.env.STAGING_SENDGRID_API_KEY,
        from: 'staging@winston-ai.com',
        templates: {
          welcome: 'staging-welcome-template',
          resetPassword: 'staging-reset-password-template'
        }
      },
      monitoring: {
        sentryDsn: process.env.STAGING_SENTRY_DSN,
        analyticsId: process.env.STAGING_ANALYTICS_ID,
        logLevel: 'info'
      },
      security: {
        corsOrigin: 'https://staging.winston-ai.com',
        rateLimit: {
          window: 15,
          max: 100
        },
        ssl: true
      },
      cache: {
        enabled: true,
        type: 'redis',
        ttl: 600 // 10 minutes
      },
      env: {
        NODE_ENV: 'staging',
        NEXT_PUBLIC_SUPABASE_URL: process.env.STAGING_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.STAGING_SUPABASE_ANON_KEY,
      },
    },
    production: {
      name: 'production',
      domain: 'app.winston-ai.com',
      database: {
        host: process.env.PROD_DB_HOST,
        user: process.env.PROD_DB_USER,
        password: process.env.PROD_DB_PASSWORD,
        name: 'winston_ai',
        pool: {
          min: 10,
          max: 50
        }
      },
      auth: {
        secret: process.env.PROD_NEXTAUTH_SECRET,
        jwtSecret: process.env.PROD_JWT_SECRET,
        sessionTimeout: 8 * 60 * 60, // 8 hours
        google: {
          clientId: process.env.PROD_GOOGLE_CLIENT_ID,
          clientSecret: process.env.PROD_GOOGLE_CLIENT_SECRET
        }
      },
      email: {
        host: 'smtp.sendgrid.net',
        port: 587,
        user: 'apikey',
        password: process.env.PROD_SENDGRID_API_KEY,
        from: 'noreply@winston-ai.com',
        templates: {
          welcome: 'prod-welcome-template',
          resetPassword: 'prod-reset-password-template'
        }
      },
      monitoring: {
        sentryDsn: process.env.PROD_SENTRY_DSN,
        analyticsId: process.env.PROD_ANALYTICS_ID,
        logLevel: 'warn'
      },
      security: {
        corsOrigin: 'https://app.winston-ai.com',
        rateLimit: {
          window: 15,
          max: 100
        },
        ssl: true
      },
      cache: {
        enabled: true,
        type: 'redis',
        ttl: 1800 // 30 minutes
      },
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_SUPABASE_URL: process.env.PROD_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.PROD_SUPABASE_ANON_KEY,
      },
    }
  },
  deployment: {
    strategies: {
      blueGreen: {
        enabled: true,
        healthCheck: {
          endpoint: '/api/health',
          interval: 30,
          timeout: 10,
          successThreshold: 3,
          failureThreshold: 2
        },
        rollback: {
          enabled: true,
          threshold: 0.05 // 5% error rate
        }
      },
      canary: {
        enabled: true,
        percentage: 10,
        duration: 3600, // 1 hour
        metrics: ['error_rate', 'response_time', 'cpu_usage'],
        thresholds: {
          error_rate: 0.01,
          response_time: 1000,
          cpu_usage: 80
        }
      }
    },
    staging: {
      branch: 'staging',
      strategy: 'blueGreen',
      commands: [
        'npm install',
        'npm run build',
        'npm run test',
        'npm run start'
      ],
      healthCheck: {
        endpoint: '/api/health',
        interval: 30,
        timeout: 10,
        successThreshold: 3,
        failureThreshold: 2
      },
      rollback: {
        enabled: true,
        threshold: 0.05
      }
    },
    production: {
      branch: 'main',
      strategy: 'canary',
      commands: [
        'npm install',
        'npm run build',
        'npm run test',
        'npm run start'
      ],
      healthCheck: {
        endpoint: '/api/health',
        interval: 30,
        timeout: 10,
        successThreshold: 3,
        failureThreshold: 2
      },
      rollback: {
        enabled: true,
        threshold: 0.01
      }
    }
  },
  healthChecks: {
    database: {
      query: 'SELECT 1',
      timeout: 5000,
      interval: 30000
    },
    memory: {
      threshold: 0.9,
      interval: 60000
    },
    cpu: {
      threshold: 0.8,
      interval: 60000
    },
    disk: {
      threshold: 0.9,
      interval: 300000
    },
    network: {
      timeout: 5000,
      interval: 30000
    }
  }
}; 