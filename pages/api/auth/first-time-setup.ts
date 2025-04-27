import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if any users exist
    const existingUsers = await prisma.user.findMany();
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Setup already completed' });
    }

    const { name, email, password, teamName } = req.body;

    // Validate input
    if (!name || !email || !password || !teamName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create team
    const team = await prisma.team.create({
      data: {
        name: teamName,
        settings: {
          create: {
            maxUsers: 5,
            plan: 'FREE',
          },
        },
      },
    });

    // Create admin user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        teamId: team.id,
        teamRole: 'OWNER',
        userSettings: {
          create: {
            emailSignature: '',
            defaultTemplate: undefined,
            templates: undefined,
          },
        },
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    // Remove sensitive data from response
    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      user: userWithoutPassword,
      team,
      message: 'Account created successfully. Please check your email to verify your account.',
    });
  } catch (error) {
    console.error('First-time setup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 