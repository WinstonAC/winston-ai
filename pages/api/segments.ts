import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const segments = await prisma.segment.findMany({
        where: {
          OR: [
            { userId: session.user.id },
            {
              team: {
                members: {
                  some: {
                    id: session.user.id,
                  },
                },
              },
            },
          ],
        },
        include: {
          leads: true,
        },
      });

      return res.status(200).json(segments);
    } catch (error) {
      console.error('Error fetching segments:', error);
      return res.status(500).json({ error: 'Failed to fetch segments' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, description, criteria } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const segment = await prisma.segment.create({
        data: {
          name,
          description,
          criteria: JSON.parse(criteria),
          user: {
            connect: { id: session.user.id }
          },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return res.status(201).json(segment);
    } catch (error) {
      console.error('Error creating segment:', error);
      return res.status(500).json({ error: 'Failed to create segment' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 