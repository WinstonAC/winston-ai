import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { Activity } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized - Please log in' });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { 
        team: true,
      },
    });

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        details: 'Unable to find user record'
      });
    }

    // Initialize stats with default values
    let stats = {
      totalLeads: 0,
      openRate: 0,
      responseRate: 0,
      meetings: 0,
    };

    let recentActivity: Activity[] = [];

    // If user has a team, get team-specific stats
    if (user.team) {
      // Get total leads count
      stats.totalLeads = await prisma.lead.count({
        where: { teamId: user.team.id },
      });

      // Calculate open rate (mock data for now)
      stats.openRate = 65.2;

      // Calculate response rate (mock data for now)
      stats.responseRate = 42.8;

      // Get activities count as meetings
      stats.meetings = await prisma.activity.count({
        where: { 
          teamId: user.team.id,
          type: 'meeting_scheduled'
        },
      });

      // Get recent activity
      const activities = await prisma.activity.findMany({
        where: { teamId: user.team.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          lead: true,
        },
      });

      recentActivity = activities.map((activity) => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        leadId: activity.leadId,
        userId: activity.userId,
        teamId: activity.teamId,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt
      }));
    }

    return res.status(200).json({
      stats,
      recentActivity,
      hasTeam: !!user.team,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
} 