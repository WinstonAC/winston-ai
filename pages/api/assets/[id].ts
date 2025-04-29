import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: Replace with real user ID from Supabase Auth session
  const userId = req.query.userId as string || 'demo-user-id';
  const assetId = req.query.id as string;

  if (req.method === 'GET') {
    // Fetch asset by ID for user
    const { data: asset, error } = await supabase
      .from('templateAssets')
      .select('*')
      .eq('id', assetId)
      .eq('userId', userId)
      .single();
    if (error) return res.status(500).json({ error: error.message });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    return res.status(200).json(asset);
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('templateAssets')
      .delete()
      .eq('id', assetId)
      .eq('userId', userId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 