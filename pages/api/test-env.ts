import { NextApiRequest, NextApiResponse } from 'next';
import { env } from '@/lib/env-loader';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Return environment variables (excluding sensitive ones)
  return res.status(200).json({
    NODE_ENV: env.NODE_ENV,
    NEXTAUTH_URL: env.NEXTAUTH_URL,
    DATABASE_URL: env.DATABASE_URL ? '***' : undefined,
    // Log which variables are present without exposing their values
    hasDatabaseUrl: !!env.DATABASE_URL,
    hasNextAuthSecret: !!env.NEXTAUTH_SECRET,
    hasGoogleClientId: !!env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!env.GOOGLE_CLIENT_SECRET,
  });
} 