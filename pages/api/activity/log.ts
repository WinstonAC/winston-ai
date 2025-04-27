import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { type, description, teamId, leadId } = req.body;

    if (!type || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const activity = await prisma.activity.create({
      data: {
        type,
        description,
        user: {
          connect: { id: session.user.id }
        },
        ...(leadId && {
          lead: {
            connect: { id: leadId }
          }
        }),
        ...(teamId && {
          team: {
            connect: { id: teamId }
          }
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        lead: {
          select: {
            name: true,
            email: true,
            status: true
          }
        },
        team: {
          select: {
            name: true
          }
        }
      }
    });

    return res.status(200).json(activity);
  } catch (error) {
    console.error('Error logging activity:', error);
    return res.status(500).json({ error: 'Failed to log activity' });
  }
} 