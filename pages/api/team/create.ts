import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    console.log('Team creation attempt - Session:', session);

    if (!session?.user?.id) {
      console.log('No session or user ID found');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log('Creating team for user:', session.user.id);

    // Simple team creation without any checks
    const team = await prisma.team.create({
      data: {
        name: `${session.user.name || 'User'}'s Workspace`,
        users: {
          connect: { id: session.user.id }
        },
        settings: {
          create: {
            maxUsers: 5,
            plan: 'FREE'
          }
        }
      },
    });

    console.log('Team created successfully:', team);

    // Update user's role
    await prisma.user.update({
      where: { id: session.user.id },
      data: { teamRole: 'OWNER' },
    });

    console.log('User role updated to OWNER');

    return res.status(201).json(team);
  } catch (error) {
    console.error('Detailed error in team creation:', error);
    // Check if it's a Prisma error
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        message: 'Team already exists',
        details: 'You already have a team created'
      });
    }
    return res.status(500).json({ 
      message: 'Failed to create team',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
} 