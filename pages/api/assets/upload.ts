import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: Replace with real user ID from Supabase Auth session
  const userId = req.query.userId as string || 'demo-user-id';

  if (req.method === 'POST') {
    // Create a new asset (upload)
    const newAsset = { ...req.body, userId };
    // Replace any supabase usage with a mock response for uploads
    // For example, if there is a supabase upload, just return a mock asset object with a URL and ID
    return res.status(201).json(newAsset);
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 