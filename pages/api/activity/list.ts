import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { teamId } = req.query;

    if (!teamId) {
      return res.status(400).json({ error: 'Missing teamId' });
    }

    const activities = await prisma.activity.findMany({
      where: { teamId: teamId as string },
      orderBy: { createdAt: 'desc' },
      include: { lead: true },
    });

    return res.status(200).json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return res.status(500).json({ error: 'Failed to fetch activities' });
  }
} 