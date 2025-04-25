import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient, PerformanceMetrics, ErrorLog, ApiMetrics } from '@prisma/client';

const prisma = new PrismaClient();

// Performance metrics
interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  databaseQueryTime: number;
  memoryUsage: number;
}

// Error tracking
interface ErrorLog {
  error: Error;
  context: {
    userId?: string;
    path?: string;
    method?: string;
    timestamp: Date;
  };
}

// API monitoring
interface ApiMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  userId?: string;
}

export class MonitoringService {
  constructor(private prisma: PrismaClient) {}

  async trackPerformance(data: Omit<PerformanceMetrics, 'id' | 'timestamp'>) {
    // Validate required fields
    if (!data.pageLoadTime || !data.apiResponseTime || !data.databaseQueryTime || !data.memoryUsage) {
      throw new Error('Missing required performance metrics');
    }

    return this.prisma.performanceMetrics.create({
      data: {
        ...data,
        timestamp: new Date(),
      },
    });
  }

  async trackError(data: Omit<ErrorLog, 'id' | 'timestamp'>) {
    // Validate required fields
    if (!data.message) {
      throw new Error('Error message is required');
    }

    // Set default severity if not provided
    const severity = data.severity || 'error';

    return this.prisma.errorLog.create({
      data: {
        ...data,
        severity,
        timestamp: new Date(),
      },
    });
  }

  async trackApiCall(data: Omit<ApiMetrics, 'id' | 'timestamp'>) {
    // Validate required fields
    if (!data.endpoint || !data.method || !data.responseTime || !data.statusCode) {
      throw new Error('Missing required API metrics');
    }

    return this.prisma.apiMetrics.create({
      data: {
        ...data,
        timestamp: new Date(),
      },
    });
  }

  async getLogs(
    type: string,
    startDate?: Date,
    endDate?: Date,
    filters?: {
      userId?: string;
      severity?: string;
      environment?: string;
      statusCode?: number;
    }
  ): Promise<PerformanceMetrics[] | ErrorLog[] | ApiMetrics[]> {
    const where: any = {
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Add additional filters based on type
    if (filters) {
      if (filters.userId) where.userId = filters.userId;
      
      switch (type) {
        case 'error':
          if (filters.severity) where.severity = filters.severity;
          if (filters.environment) where.environment = filters.environment;
          break;
        case 'api':
          if (filters.statusCode) where.statusCode = filters.statusCode;
          break;
      }
    }

    switch (type) {
      case 'performance':
        return this.prisma.performanceMetrics.findMany({ 
          where,
          orderBy: { timestamp: 'desc' },
          take: 1000 // Limit results to prevent memory issues
        });
      case 'error':
        return this.prisma.errorLog.findMany({ 
          where,
          orderBy: { timestamp: 'desc' },
          take: 1000
        });
      case 'api':
        return this.prisma.apiMetrics.findMany({ 
          where,
          orderBy: { timestamp: 'desc' },
          take: 1000
        });
      default:
        throw new Error('Invalid log type');
    }
  }

  async getErrorStats(startDate: Date, endDate: Date) {
    return this.prisma.errorLog.groupBy({
      by: ['severity', 'environment'],
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        severity: true,
      },
    });
  }

  async getApiStats(startDate: Date, endDate: Date) {
    return this.prisma.apiMetrics.groupBy({
      by: ['endpoint', 'statusCode'],
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      _avg: {
        responseTime: true,
      },
      _count: {
        endpoint: true,
      },
    });
  }
}

// API route for monitoring
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  const monitoring = new MonitoringService(prisma);

  if (req.method === 'POST') {
    const { type, data } = req.body;

    switch (type) {
      case 'performance':
        await monitoring.trackPerformance(data);
        break;
      case 'error':
        await monitoring.trackError(data.error, {
          ...data.context,
          userId: session?.user?.id,
        });
        break;
      case 'api':
        await monitoring.trackApiCall({
          ...data,
          userId: session?.user?.id,
        });
        break;
    }

    return res.status(200).json({ success: true });
  }

  if (req.method === 'GET') {
    const { type, startDate, endDate } = req.query;

    let data;
    switch (type) {
      case 'performance':
        data = await monitoring.getLogs(type, new Date(startDate as string), new Date(endDate as string));
        break;
      case 'error':
        data = await monitoring.getLogs(type, new Date(startDate as string), new Date(endDate as string));
        break;
      case 'api':
        data = await monitoring.getLogs(type, new Date(startDate as string), new Date(endDate as string));
        break;
    }

    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 