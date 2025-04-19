import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { name, email, currentPassword, newPassword } = req.body;

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email as string },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password if trying to change password
    if (newPassword) {
      const isValid = await bcrypt.compare(currentPassword, user.password || '');
      if (!isValid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
    };

    // Hash new password if provided
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    // Return updated user without password
    const { password: _, ...userWithoutPassword } = updatedUser;
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Settings update error:', error);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
} 