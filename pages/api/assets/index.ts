import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: Replace with real user ID from Supabase Auth session
  const userId = req.query.userId as string || 'demo-user-id';

  if (req.method === 'GET') {
    // List all assets for user
    const { data: assets, error } = await supabase
      .from('templateAssets')
      .select('*')
      .eq('userId', userId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(assets || []);
  }

  if (req.method === 'POST') {
    // Create a new asset
    const newAsset = { ...req.body, userId };
    const { data: asset, error } = await supabase
      .from('templateAssets')
      .insert(newAsset)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(asset);
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 