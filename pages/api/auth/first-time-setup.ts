import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({ message: "Setup skipped – Prisma removed for MVP" });
} 