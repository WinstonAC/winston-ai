import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient, PerformanceMetrics as PrismaPerformanceMetrics, ErrorLog as PrismaErrorLog, ApiMetrics as PrismaApiMetrics } from '@prisma/client';

const prisma = new PrismaClient();

// Performance metrics
interface PerformanceMetricsData {
  pageLoadTime: number;
  apiResponseTime: number;
  databaseQueryTime: number;
  memoryUsage: number;
  userId: string;
}

// Error tracking
interface ErrorLogData {
  message: string;
  error: Error;
  severity?: string;
  context: {
    userId: string;
    path?: string;
    method?: string;
    timestamp: Date;
  };
  userId: string;
}

// API monitoring
interface ApiMetricsData {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  userId: string;
}

export class MonitoringService {
  constructor(private prisma: PrismaClient) {}

  async trackPerformance(data: Omit<PerformanceMetricsData, 'id' | 'createdAt'>) {
    // Validate required fields
    if (!data.pageLoadTime || !data.apiResponseTime || !data.databaseQueryTime || !data.memoryUsage || !data.userId) {
      throw new Error('Missing required performance metrics');
    }

    return this.prisma.performanceMetrics.create({
      data: {
        pageLoadTime: data.pageLoadTime,
        apiResponseTime: data.apiResponseTime,
        databaseQueryTime: data.databaseQueryTime,
        memoryUsage: data.memoryUsage,
        user: {
          connect: { id: data.userId }
        },
        createdAt: new Date(),
      },
    });
  }

  async trackError(data: ErrorLogData) {
    try {
      const log = await this.prisma.errorLog.create({
        data: {
          message: data.message,
          error: data.error instanceof Error ? data.error.toString() : String(data.error),
          severity: data.severity || 'error',
          context: data.context || {},
          userId: data.userId,
          createdAt: new Date()
        }
      });
      return log;
    } catch (error) {
      console.error('Error tracking error:', error);
      throw error;
    }
  }

  async trackApiCall(data: Omit<ApiMetricsData, 'id' | 'createdAt'>) {
    // Validate required fields
    if (!data.endpoint || !data.method || !data.responseTime || !data.statusCode || !data.userId) {
      throw new Error('Missing required API metrics');
    }

    return this.prisma.apiMetrics.create({
      data: {
        endpoint: data.endpoint,
        method: data.method,
        responseTime: data.responseTime,
        statusCode: data.statusCode,
        user: {
          connect: { id: data.userId }
        },
        createdAt: new Date(),
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
  ): Promise<PrismaPerformanceMetrics[] | PrismaErrorLog[] | PrismaApiMetrics[]> {
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
          orderBy: { createdAt: 'desc' },
          take: 1000 // Limit results to prevent memory issues
        });
      case 'error':
        return this.prisma.errorLog.findMany({ 
          where,
          orderBy: { createdAt: 'desc' },
          take: 1000
        });
      case 'api':
        return this.prisma.apiMetrics.findMany({ 
          where,
          orderBy: { createdAt: 'desc' },
          take: 1000
        });
      default:
        throw new Error('Invalid log type');
    }
  }

  async getErrorStats(startDate: Date, endDate: Date) {
    return this.prisma.errorLog.groupBy({
      by: ['severity'],
      where: {
        createdAt: {
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
        createdAt: {
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
        await monitoring.trackError({
          ...data.error,
          context: {
            ...data.context,
            userId: session?.user?.id,
          }
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