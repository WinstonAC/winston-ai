import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Get the current user's team
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { teamId: true, teamRole: true },
    });

    if (!user?.teamId) {
      return res.status(404).json({ error: 'User is not part of a team' });
    }

    if (user.teamRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Only team admins can invite members' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Check for existing invite
    const existingInvite = await prisma.teamInvite.findFirst({
      where: {
        email,
        teamId: user.teamId,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingInvite) {
      return res.status(400).json({ error: 'Invite already exists' });
    }

    // Create invitation
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invite = await prisma.teamInvite.create({
      data: {
        email,
        token,
        teamId: user.teamId,
        expiresAt,
      },
    });

    // TODO: Send email invitation
    // This would be implemented using your email service of choice

    return res.status(201).json({
      message: 'Invitation sent successfully',
      invite: {
        id: invite.id,
        email: invite.email,
        expiresAt: invite.expiresAt,
      },
    });
  } catch (error) {
    console.error('Error creating invitation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 