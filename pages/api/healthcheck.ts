import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'error';
  timestamp: string;
  services: {
    database: {
      status: 'connected' | 'error';
      response_time?: number;
      error?: string;
    };
    api_endpoints: {
      leads: 'working' | 'error';
      campaigns: 'working' | 'error';
      dashboard: 'working' | 'error';
    };
    tables: {
      users: 'accessible' | 'error';
      leads: 'accessible' | 'error';
      campaigns: 'accessible' | 'error';
    };
  };
  version: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthCheckResponse>
) {
  const startTime = Date.now();
  
  const healthCheck: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: { status: 'connected' },
      api_endpoints: {
        leads: 'working',
        campaigns: 'working',
        dashboard: 'working'
      },
      tables: {
        users: 'accessible',
        leads: 'accessible',
        campaigns: 'accessible'
      }
    },
    version: '1.0.0'
  };

  try {
    // Test Supabase connection
    const dbStartTime = Date.now();
    const { data: testQuery, error: dbError } = await supabase
      .from('leads')
      .select('count(*)', { count: 'exact', head: true });
    
    const dbResponseTime = Date.now() - dbStartTime;
    
    if (dbError) {
      healthCheck.services.database = {
        status: 'error',
        error: dbError.message
      };
      healthCheck.status = 'degraded';
    } else {
      healthCheck.services.database = {
        status: 'connected',
        response_time: dbResponseTime
      };
    }

    // Test table accessibility
    const tableTests = [
      { name: 'users', table: 'users' },
      { name: 'leads', table: 'leads' },
      { name: 'campaigns', table: 'campaigns' }
    ];

    for (const test of tableTests) {
      try {
        const { error } = await supabase
          .from(test.table)
          .select('count(*)', { count: 'exact', head: true });
          
        if (error) {
          healthCheck.services.tables[test.name as keyof typeof healthCheck.services.tables] = 'error';
          healthCheck.status = 'degraded';
        }
      } catch (err) {
        healthCheck.services.tables[test.name as keyof typeof healthCheck.services.tables] = 'error';
        healthCheck.status = 'degraded';
      }
    }

    // Test internal API endpoints
    const baseUrl = req.headers.host ? `http://${req.headers.host}` : 'http://localhost:3000';
    
    const apiTests = [
      { name: 'leads', endpoint: '/api/leads' },
      { name: 'campaigns', endpoint: '/api/campaigns' },
      { name: 'dashboard', endpoint: '/api/dashboard/stats' }
    ];

    for (const test of apiTests) {
      try {
        const response = await fetch(`${baseUrl}${test.endpoint}`, {
          method: 'GET',
          headers: { 'User-Agent': 'HealthCheck/1.0' }
        });
        
        if (!response.ok) {
          healthCheck.services.api_endpoints[test.name as keyof typeof healthCheck.services.api_endpoints] = 'error';
          healthCheck.status = 'degraded';
        }
      } catch (err) {
        healthCheck.services.api_endpoints[test.name as keyof typeof healthCheck.services.api_endpoints] = 'error';
        healthCheck.status = 'degraded';
      }
    }

  } catch (error) {
    console.error('Health check error:', error);
    healthCheck.status = 'error';
    healthCheck.services.database = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  // Set appropriate HTTP status
  const httpStatus = healthCheck.status === 'healthy' ? 200 : 
                    healthCheck.status === 'degraded' ? 207 : 500;

  res.status(httpStatus).json(healthCheck);
} 