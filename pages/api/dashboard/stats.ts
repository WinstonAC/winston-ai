import type { NextApiRequest, NextApiResponse } from 'next'

interface DashboardStats {
  totalLeads: number;
  openRate: number;
  responseRate: number;
  meetings: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DashboardStats>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' } as any);
  }

  try {
    // Demo stats for presentation
    const stats: DashboardStats = {
      totalLeads: 1247,
      openRate: 68,
      responseRate: 24,
      meetings: 42
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch dashboard stats' 
    } as any);
  }
} 