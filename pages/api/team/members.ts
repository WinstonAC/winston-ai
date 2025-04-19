import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the current user's team
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { teamId: true },
    });

    if (!user?.teamId) {
      return res.status(404).json({ error: 'User is not part of a team' });
    }

    // Fetch team members
    const members = await prisma.user.findMany({
      where: { teamId: user.teamId },
      select: {
        id: true,
        name: true,
        email: true,
        teamRole: true,
      },
    });

    // Fetch pending invitations
    const invites = await prisma.teamInvite.findMany({
      where: {
        teamId: user.teamId,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        email: true,
        expiresAt: true,
      },
    });

    return res.status(200).json({
      members,
      invites,
    });
  } catch (error) {
    console.error('Error fetching team data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 