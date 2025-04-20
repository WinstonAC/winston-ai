import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { range = '30d' } = req.query;
    const userId = session.user.id;

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default: // 30d
        startDate.setDate(now.getDate() - 30);
    }

    // Fetch analytics data
    const [leads, campaigns, activities] = await Promise.all([
      // Total leads
      prisma.lead.count({
        where: {
          userId,
          createdAt: { gte: startDate }
        }
      }),
      // Campaign metrics
      prisma.campaign.findMany({
        where: {
          userId,
          createdAt: { gte: startDate }
        },
        include: {
          metrics: true
        }
      }),
      // Recent activities
      prisma.activity.findMany({
        where: {
          userId,
          createdAt: { gte: startDate }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10,
        include: {
          lead: {
            select: {
              name: true
            }
          }
        }
      })
    ]);

    // Calculate metrics
    const totalSent = campaigns.reduce((sum, c) => sum + (c.metrics?.sent || 0), 0);
    const totalOpened = campaigns.reduce((sum, c) => sum + (c.metrics?.opened || 0), 0);
    const totalReplied = campaigns.reduce((sum, c) => sum + (c.metrics?.replied || 0), 0);
    const totalMeetings = campaigns.reduce((sum, c) => sum + (c.metrics?.meetings || 0), 0);

    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const responseRate = totalOpened > 0 ? (totalReplied / totalOpened) * 100 : 0;

    // Format response
    const response = {
      totalLeads: leads,
      openRate: Math.round(openRate * 10) / 10,
      responseRate: Math.round(responseRate * 10) / 10,
      meetings: totalMeetings,
      recentActivity: activities.map(activity => ({
        id: activity.id,
        type: activity.type,
        leadName: activity.lead.name,
        createdAt: activity.createdAt.toISOString()
      })),
      trends: campaigns.map(campaign => ({
        date: campaign.createdAt.toISOString(),
        opens: campaign.metrics?.opened || 0,
        clicks: campaign.metrics?.clicked || 0,
        responses: campaign.metrics?.replied || 0
      }))
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Analytics API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 