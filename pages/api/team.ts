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
        const team = await prisma.team.findFirst({
          where: {
            members: {
              some: {
                userId
              }
            }
          },
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                  }
                }
              }
            }
          }
        });

        if (!team) {
          return res.status(404).json({ error: 'Team not found' });
        }

        return res.status(200).json(team);
      } catch (error) {
        console.error('Error fetching team:', error);
        return res.status(500).json({ error: 'Failed to fetch team' });
      }

    case 'POST':
      try {
        const { name, members } = req.body;

        if (!name) {
          return res.status(400).json({ error: 'Team name is required' });
        }

        const team = await prisma.team.create({
          data: {
            name,
            members: {
              create: [
                {
                  userId,
                  role: 'admin'
                },
                ...members.map((member: { userId: string; role: string }) => ({
                  userId: member.userId,
                  role: member.role
                }))
              ]
            }
          },
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                  }
                }
              }
            }
          }
        });

        return res.status(201).json(team);
      } catch (error) {
        console.error('Error creating team:', error);
        return res.status(500).json({ error: 'Failed to create team' });
      }

    case 'PUT':
      try {
        const { id, ...updateData } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Team ID is required' });
        }

        const team = await prisma.team.update({
          where: { id },
          data: updateData,
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                  }
                }
              }
            }
          }
        });

        return res.status(200).json(team);
      } catch (error) {
        console.error('Error updating team:', error);
        return res.status(500).json({ error: 'Failed to update team' });
      }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
} 