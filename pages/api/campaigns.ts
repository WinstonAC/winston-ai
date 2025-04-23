import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from './auth/[...nextauth]';
import { rateLimit } from '@/lib/rate-limit';

// Initialize rate limiter
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Apply rate limiting
    await limiter.check(res, 10, 'CACHE_TOKEN'); // 10 requests per minute
  } catch {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  // Get user session
  const session = await getServerSession(req, res, authOptions);
  
  // Check authentication
  if (!session?.user?.id) {
    console.error('Authentication failed: No user session');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;

  // Verify user exists in database
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.error('Authentication failed: User not found in database');
      return res.status(401).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error verifying user:', error);
    return res.status(500).json({ error: 'Failed to verify user' });
  }

  switch (req.method) {
    case 'GET': {
      try {
        // First try to get campaigns without related data
        const campaigns = await prisma.campaign.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' }
        });

        // Then fetch related data for each campaign
        const campaignsWithData = await Promise.all(
          campaigns.map(async (campaign) => {
            try {
              const fullCampaign = await prisma.campaign.findUnique({
                where: { id: campaign.id },
                include: {
                  template: true,
                  segment: true,
                  targetAudience: true,
                  schedule: true,
                  metrics: true
                }
              });
              return fullCampaign;
            } catch (error) {
              console.error(`Error fetching related data for campaign ${campaign.id}:`, error);
              return campaign;
            }
          })
        );

        return res.status(200).json(campaignsWithData.filter(Boolean));
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        return res.status(500).json({ 
          error: 'Failed to fetch campaigns',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    case 'POST': {
      try {
        const { name, description, templateId, segmentId, targetAudience, schedule } = req.body;

        // Validate required fields
        if (!name || !templateId || !targetAudience || !schedule) {
          return res.status(400).json({ 
            error: 'Missing required fields',
            details: {
              name: !name ? 'Campaign name is required' : undefined,
              templateId: !templateId ? 'Template ID is required' : undefined,
              targetAudience: !targetAudience ? 'Target audience is required' : undefined,
              schedule: !schedule ? 'Schedule is required' : undefined
            }
          });
        }

        // If segmentId is provided, verify it exists and user has access
        if (segmentId) {
          const segment = await prisma.segment.findFirst({
            where: {
              id: segmentId,
              OR: [
                { userId },
                { team: { users: { some: { id: userId } } } }
              ]
            }
          });

          if (!segment) {
            return res.status(404).json({ error: 'Segment not found or access denied' });
          }
        }

        const campaign = await prisma.campaign.create({
          data: {
            name,
            description,
            status: 'draft',
            userId,
            templateId,
            segmentId,
            targetAudience: {
              create: {
                segment: targetAudience.segment,
                filters: targetAudience.filters
              }
            },
            schedule: {
              create: {
                type: schedule.type,
                date: schedule.date ? new Date(schedule.date) : null,
                time: schedule.time
              }
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
            targetAudience: true,
            schedule: true,
            metrics: true,
            template: true,
            segment: true
          }
        });

        return res.status(201).json(campaign);
      } catch (error) {
        console.error('Error creating campaign:', error);
        return res.status(500).json({ 
          error: 'Failed to create campaign',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    case 'PUT': {
      try {
        const { id, segmentId, ...updateData } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Campaign ID is required' });
        }

        // If segmentId is provided, verify it exists and user has access
        if (segmentId) {
          const segment = await prisma.segment.findFirst({
            where: {
              id: segmentId,
              OR: [
                { userId },
                { team: { users: { some: { id: userId } } } }
              ]
            }
          });

          if (!segment) {
            return res.status(404).json({ error: 'Segment not found or access denied' });
          }
        }

        const campaign = await prisma.campaign.update({
          where: { id, userId },
          data: {
            ...updateData,
            segmentId,
            targetAudience: updateData.targetAudience ? {
              update: {
                segment: updateData.targetAudience.segment,
                filters: updateData.targetAudience.filters
              }
            } : undefined,
            schedule: updateData.schedule ? {
              update: {
                type: updateData.schedule.type,
                date: updateData.schedule.date ? new Date(updateData.schedule.date) : null,
                time: updateData.schedule.time
              }
            } : undefined
          },
          include: {
            targetAudience: true,
            schedule: true,
            metrics: true,
            template: true,
            segment: true
          }
        });

        return res.status(200).json(campaign);
      } catch (error) {
        console.error('Error updating campaign:', error);
        return res.status(500).json({ 
          error: 'Failed to update campaign',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    case 'DELETE': {
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
        return res.status(500).json({ 
          error: 'Failed to delete campaign',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
} 