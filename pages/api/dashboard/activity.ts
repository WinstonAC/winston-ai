import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const activities = await prisma.activity.findMany({
      where: {
        team: {
          users: {
            some: {
              id: session.user.id
            }
          }
        }
      },
      include: {
        lead: true,
        team: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    return res.status(200).json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 