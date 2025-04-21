module.exports = {
  // Application Monitoring
  app: {
    name: 'winston-ai',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version,
    release: process.env.RELEASE_TAG || 'latest'
  },

  // Error Tracking
  errorTracking: {
    sentry: {
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
      attachStacktrace: true,
      debug: process.env.NODE_ENV === 'development'
    }
  },

  // Performance Monitoring
  performance: {
    newrelic: {
      licenseKey: process.env.NEWRELIC_LICENSE_KEY,
      appName: 'winston-ai',
      distributedTracing: {
        enabled: true
      },
      transactionTracer: {
        enabled: true,
        transactionThreshold: 'apdex_f'
      }
    }
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    transports: [
      {
        type: 'console',
        options: {
          colorize: true,
          timestamp: true
        }
      },
      {
        type: 'file',
        options: {
          filename: 'logs/app.log',
          maxsize: 10485760, // 10MB
          maxFiles: 5
        }
      }
    ]
  },

  // Metrics
  metrics: {
    enabled: true,
    prefix: 'winston_ai_',
    defaultLabels: {
      environment: process.env.NODE_ENV
    },
    collectDefaultMetrics: true,
    timeout: 5000
  },

  // Health Checks
  healthChecks: {
    enabled: true,
    path: '/api/health',
    interval: 30000,
    timeout: 5000,
    checks: [
      {
        name: 'database',
        type: 'database',
        interval: 30000
      },
      {
        name: 'memory',
        type: 'memory',
        threshold: 0.9
      },
      {
        name: 'cpu',
        type: 'cpu',
        threshold: 0.8
      }
    ]
  },

  // Alerting
  alerting: {
    enabled: true,
    providers: ['email', 'slack'],
    thresholds: {
      errorRate: 0.01,
      responseTime: 1000,
      cpuUsage: 80,
      memoryUsage: 80,
      diskUsage: 90
    },
    notificationChannels: [
      {
        type: 'email',
        recipients: ['alerts@winston-ai.com']
      },
      {
        type: 'slack',
        webhookUrl: process.env.SLACK_WEBHOOK_URL,
        channel: '#alerts'
      }
    ]
  },

  // Uptime Monitoring
  uptime: {
    enabled: true,
    checkInterval: 60000,
    timeout: 10000,
    regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
    endpoints: [
      {
        url: 'https://app.winston-ai.com/api/health',
        name: 'API Health Check'
      },
      {
        url: 'https://app.winston-ai.com',
        name: 'Main Application'
      }
    ]
  }
}; 