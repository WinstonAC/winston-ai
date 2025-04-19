import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { sendTeamInviteEmail } from '@/lib/email';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, teamId } = req.body;

    // Validate input
    if (!email || !teamId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get the team and check if the user has permission to invite
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        users: {
          where: { id: session.user.id },
          select: { teamRole: true },
        },
      },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const userRole = team.users[0]?.teamRole;
    if (!userRole || !['OWNER', 'ADMIN'].includes(userRole)) {
      return res.status(403).json({ error: 'You do not have permission to invite users' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.teamId === teamId) {
        return res.status(400).json({ error: 'User is already a member of this team' });
      }
      return res.status(400).json({ error: 'User already exists' });
    }

    // Generate invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invitation
    await prisma.teamInvite.create({
      data: {
        email,
        teamId,
        token: inviteToken,
        expiresAt: inviteTokenExpiry,
        invitedBy: session.user.id,
      },
    });

    // Send invitation email
    await sendTeamInviteEmail(email, team.name, inviteToken);

    return res.status(200).json({
      message: 'Invitation sent successfully',
    });
  } catch (error) {
    console.error('Team invite error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 