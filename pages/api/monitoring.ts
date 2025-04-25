import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import { MonitoringService } from '../../lib/monitoring';

const prisma = new PrismaClient();
const monitoringService = new MonitoringService(prisma);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get user session for authentication
  const session = await getSession({ req });
  
  // Only allow authenticated users
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'POST') {
      const { type, data } = req.body;

      if (!type || !data) {
        return res.status(400).json({ error: 'Type and data are required' });
      }

      // Add user ID to the data
      const dataWithUser = {
        ...data,
        userId: session.user.id,
      };

      switch (type) {
        case 'performance':
          await monitoringService.trackPerformance(dataWithUser);
          break;
        case 'error':
          await monitoringService.trackError(dataWithUser);
          break;
        case 'api':
          await monitoringService.trackApiCall(dataWithUser);
          break;
        default:
          return res.status(400).json({ error: 'Invalid monitoring type' });
      }

      return res.status(200).json({ success: true });
    } else if (req.method === 'GET') {
      const { type, startDate, endDate, ...filters } = req.query;

      if (!type || typeof type !== 'string') {
        return res.status(400).json({ error: 'Type parameter is required' });
      }

      // Validate date parameters
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 24 * 60 * 60 * 1000); // Default to last 24 hours
      const end = endDate ? new Date(endDate as string) : new Date();

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }

      // Get logs with filters
      const logs = await monitoringService.getLogs(
        type,
        start,
        end,
        filters as any
      );

      // Get additional stats if requested
      let stats;
      if (type === 'error') {
        stats = await monitoringService.getErrorStats(start, end);
      } else if (type === 'api') {
        stats = await monitoringService.getApiStats(start, end);
      }

      return res.status(200).json({
        logs,
        stats,
        timeRange: {
          start,
          end,
        },
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Monitoring API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await prisma.$disconnect();
  }
} 