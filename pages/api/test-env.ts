import { NextApiRequest, NextApiResponse } from 'next';

const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NODE_ENV: process.env.NODE_ENV,
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Return environment variables (excluding sensitive ones)
  return res.status(200).json({
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    nodeEnv: env.NODE_ENV,
  });
} 