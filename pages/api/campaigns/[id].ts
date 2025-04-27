import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const campaignId = req.query.id as string;

  if (req.method === 'GET') {
    try {
      const campaign = await prisma.campaign.findUnique({
        where: {
          id: campaignId,
          userId: session.user.id,
        },
        include: {
          template: true,
          segments: true,
          metrics: true,
        },
      });

      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      return res.status(200).json(campaign);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      return res.status(500).json({ error: 'Failed to fetch campaign' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { name, description, templateId, targetAudience, schedule, status } = req.body;

      const campaign = await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          name,
          description,
          template: templateId ? {
            connect: { id: templateId }
          } : undefined,
          segments: targetAudience?.segment ? {
            connect: { id: targetAudience.segment }
          } : undefined,
          schedule: schedule ? {
            update: {
              type: schedule.type,
              date: schedule.date ? new Date(schedule.date) : null,
              time: schedule.time
            }
          } : undefined,
          status: status || 'draft',
          updatedAt: new Date()
        },
        include: {
          template: true,
          segments: true,
          metrics: true,
        },
      });

      return res.status(200).json(campaign);
    } catch (error) {
      console.error('Error updating campaign:', error);
      return res.status(500).json({ error: 'Failed to update campaign' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.campaign.delete({
        where: {
          id: campaignId,
          userId: session.user.id,
        },
      });

      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      return res.status(500).json({ error: 'Failed to delete campaign' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 