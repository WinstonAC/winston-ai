import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const campaigns = await prisma.campaign.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          template: true,
          segment: true,
          metrics: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return res.status(200).json(campaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, description, templateId, targetAudience, schedule } = req.body;

      const campaign = await prisma.campaign.create({
        data: {
          name,
          description,
          templateId,
          segmentId: targetAudience.segment,
          filters: targetAudience.filters,
          scheduleType: schedule.type,
          scheduleDate: schedule.date ? new Date(schedule.date) : null,
          scheduleTime: schedule.time,
          status: 'draft',
          userId: session.user.id,
        },
      });

      return res.status(201).json(campaign);
    } catch (error) {
      console.error('Error creating campaign:', error);
      return res.status(500).json({ error: 'Failed to create campaign' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 