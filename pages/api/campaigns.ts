import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;

  switch (req.method) {
    case 'GET':
      try {
        const campaigns = await prisma.campaign.findMany({
          where: { userId },
          include: {
            metrics: true,
            template: true,
            targetAudience: true
          }
        });
        return res.status(200).json(campaigns);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        return res.status(500).json({ error: 'Failed to fetch campaigns' });
      }

    case 'POST':
      try {
        const { name, description, templateId, targetAudience, schedule } = req.body;

        // Validate required fields
        if (!name || !templateId || !targetAudience) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const campaign = await prisma.campaign.create({
          data: {
            name,
            description,
            status: 'draft',
            userId,
            templateId,
            targetAudience: {
              create: targetAudience
            },
            schedule: {
              create: schedule
            },
            metrics: {
              create: {
                sent: 0,
                delivered: 0,
                opened: 0,
                clicked: 0,
                bounced: 0,
                replied: 0,
                meetings: 0
              }
            }
          },
          include: {
            metrics: true,
            template: true,
            targetAudience: true
          }
        });

        return res.status(201).json(campaign);
      } catch (error) {
        console.error('Error creating campaign:', error);
        return res.status(500).json({ error: 'Failed to create campaign' });
      }

    case 'PUT':
      try {
        const { id, ...updateData } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Campaign ID is required' });
        }

        const campaign = await prisma.campaign.update({
          where: { id, userId },
          data: updateData,
          include: {
            metrics: true,
            template: true,
            targetAudience: true
          }
        });

        return res.status(200).json(campaign);
      } catch (error) {
        console.error('Error updating campaign:', error);
        return res.status(500).json({ error: 'Failed to update campaign' });
      }

    case 'DELETE':
      try {
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
          return res.status(400).json({ error: 'Campaign ID is required' });
        }

        await prisma.campaign.delete({
          where: { id, userId }
        });

        return res.status(204).end();
      } catch (error) {
        console.error('Error deleting campaign:', error);
        return res.status(500).json({ error: 'Failed to delete campaign' });
      }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
} 