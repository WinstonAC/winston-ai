import type { NextApiRequest, NextApiResponse } from 'next'

interface ActivityItem {
  id: string;
  type: string;
  leadName: string;
  createdAt: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ActivityItem[]>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' } as any);
  }

  try {
    // Demo activity data
    const activities: ActivityItem[] = [
      {
        id: '1',
        type: 'opened',
        leadName: 'John Smith',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        type: 'clicked',
        leadName: 'Sarah Johnson',
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        type: 'booked',
        leadName: 'Mike Chen',
        createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        type: 'new',
        leadName: 'Emily Davis',
        createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString()
      },
      {
        id: '5',
        type: 'opened',
        leadName: 'Alex Thompson',
        createdAt: new Date(Date.now() - 150 * 60 * 1000).toISOString()
      }
    ];

    return res.status(200).json(activities);
  } catch (error) {
    console.error('Dashboard activity error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch dashboard activity' 
    } as any);
  }
} 