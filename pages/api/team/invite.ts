import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });

    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        team: true,
      },
    });

    if (!user?.team || !['ADMIN', 'OWNER'].includes(user.teamRole || '')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user is already in the team
    const existingTeamMember = await prisma.user.findFirst({
      where: {
        email,
        teamId: user.team.id,
      },
    });

    if (existingTeamMember) {
      return res.status(400).json({ error: 'User is already in the team' });
    }

    // Check if there's already a pending invite
    const existingInvite = await prisma.teamInvite.findFirst({
      where: {
        email,
        teamId: user.team.id,
      },
    });

    if (existingInvite) {
      return res.status(400).json({ error: 'Invite already sent to this email' });
    }

    // Generate invite token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    // Create invite
    const invite = await prisma.teamInvite.create({
      data: {
        email,
        token,
        expiresAt,
        teamId: user.team.id,
        invitedBy: user.id,
      },
    });

    // TODO: Send email to invited user
    // For now, we'll just return success
    return res.status(200).json({ message: 'Invite sent successfully' });
  } catch (error) {
    console.error('Team invite error:', error);
    return res.status(500).json({ error: 'Failed to send invite' });
  }
} 