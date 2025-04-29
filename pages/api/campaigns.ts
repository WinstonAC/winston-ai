import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: Replace with real user ID from Supabase Auth session
  const userId = req.query.userId as string || 'demo-user-id';

  switch (req.method) {
    case 'GET': {
      // List all campaigns for user
      const { data: campaigns, error } = await supabase
        .from('campaigns')
        .select('*, template(*), segments(*), targetAudience(*), schedule(*), metrics(*)')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(campaigns || []);
    }
    case 'POST': {
      // Create a new campaign
      const newCampaign = { ...req.body, userId };
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .insert(newCampaign)
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(campaign);
    }
    case 'PUT': {
      // Update a campaign (by id in body)
      const { id, ...updateData } = req.body;
      if (!id) return res.status(400).json({ error: 'Campaign ID is required' });
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .update(updateData)
        .eq('id', id)
        .eq('userId', userId)
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(campaign);
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
} 