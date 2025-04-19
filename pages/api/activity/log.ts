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

    const { type, teamId, leadId } = req.body;

    if (!type || !teamId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const activity = await prisma.activity.create({
      data: {
        type,
        teamId,
        leadId: leadId || undefined,
      },
    });

    return res.status(200).json(activity);
  } catch (error) {
    console.error('Error logging activity:', error);
    return res.status(500).json({ error: 'Failed to log activity' });
  }
} 