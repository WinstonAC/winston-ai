import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: Replace with real user ID from Supabase Auth session
  const userId = req.query.userId as string || 'demo-user-id';
  const campaignId = req.query.id as string;

  if (req.method === 'GET') {
    // Fetch campaign by ID for user
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('*, template(*), segments(*), metrics(*)')
      .eq('id', campaignId)
      .eq('userId', userId)
      .single();
    if (error) return res.status(500).json({ error: error.message });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    return res.status(200).json(campaign);
  }

  if (req.method === 'PUT') {
    const updateData = req.body;
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .update(updateData)
      .eq('id', campaignId)
      .eq('userId', userId)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(campaign);
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', campaignId)
      .eq('userId', userId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 