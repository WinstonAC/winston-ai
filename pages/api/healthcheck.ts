import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  checks: {
    database: {
      status: 'healthy' | 'unhealthy';
      message: string;
      details?: any;
    };
    api: {
      status: 'healthy' | 'unhealthy';
      message: string;
    };
    environment: {
      status: 'healthy' | 'unhealthy';
      message: string;
      details?: any;
    };
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<HealthStatus>) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: { status: 'unhealthy', message: 'Method not allowed' },
        api: { status: 'unhealthy', message: 'Method not allowed' },
        environment: { status: 'unhealthy', message: 'Method not allowed' }
      }
    });
  }

  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: 'healthy', message: 'Database connection successful' },
      api: { status: 'healthy', message: 'API endpoints responding' },
      environment: { status: 'healthy', message: 'Environment variables configured' }
    }
  };

  // Check database connectivity
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('count')
      .limit(1);

    if (error) {
      healthStatus.checks.database.status = 'unhealthy';
      healthStatus.checks.database.message = 'Database query failed';
      healthStatus.checks.database.details = error.message;
    } else {
      healthStatus.checks.database.details = { query: 'successful', data: data?.length || 0 };
    }
  } catch (error) {
    healthStatus.checks.database.status = 'unhealthy';
    healthStatus.checks.database.message = 'Database connection failed';
    healthStatus.checks.database.details = error instanceof Error ? error.message : 'Unknown error';
  }

  // Check environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    healthStatus.checks.environment.status = 'unhealthy';
    healthStatus.checks.environment.message = 'Missing required environment variables';
    healthStatus.checks.environment.details = { missing: missingEnvVars };
  } else {
    healthStatus.checks.environment.details = { 
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
      supabase_anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing',
      service_role_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'missing'
    };
  }

  // Check if any component is unhealthy
  const unhealthyChecks = Object.values(healthStatus.checks).filter(check => check.status === 'unhealthy');
  if (unhealthyChecks.length > 0) {
    healthStatus.status = 'unhealthy';
  }

  const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
  return res.status(statusCode).json(healthStatus);
} 