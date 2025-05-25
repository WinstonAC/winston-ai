import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

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

    // Return mock analytics data for now
    return res.status(200).json({
      leads: {
        total: 0,
        new: 0,
        active: 0
      },
      campaigns: [],
      activities: []
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
} 