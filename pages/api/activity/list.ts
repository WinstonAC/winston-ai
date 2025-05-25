import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, { providers: [] });
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { teamId } = req.query;

    if (!teamId) {
      return res.status(400).json({ error: 'Missing teamId' });
    }

    const activities = [
      {
        id: '1',
        type: 'meeting_scheduled',
        description: 'Meeting scheduled with Lead 1',
        leadId: 'lead-1',
        userId: session.user.id,
        teamId: teamId as string,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lead: {
          id: 'lead-1',
          name: 'Lead 1',
          email: 'lead1@example.com',
        },
      },
    ];

    return res.status(200).json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return res.status(500).json({ error: 'Failed to fetch activities' });
  }
} 