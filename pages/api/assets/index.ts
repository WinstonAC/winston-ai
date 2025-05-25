import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: Replace with real user ID from Supabase Auth session
  const userId = req.query.userId as string || 'demo-user-id';

  if (req.method === 'GET') {
    // List all assets for user
    const assets = [
      {
        id: '1',
        name: 'Asset 1',
        url: 'https://example.com/asset1.jpg',
        type: 'image',
        userId,
      },
      {
        id: '2',
        name: 'Asset 2',
        url: 'https://example.com/asset2.jpg',
        type: 'image',
        userId,
      },
    ];
    return res.status(200).json(assets || []);
  }

  if (req.method === 'POST') {
    // Create a new asset
    const newAsset = { ...req.body, userId };
    const asset = {
      id: '3',
      ...newAsset,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return res.status(201).json(asset);
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 