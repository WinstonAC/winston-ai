import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import rateLimit from '../../../lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Apply rate limiting
    await limiter.check(res, 10, 'CACHE_TOKEN'); // 10 requests per minute

    // Get user from session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = session.user.id;

    switch (req.method) {
      case 'GET': {
        const { data: campaigns, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching campaigns:', error);
          return res.status(500).json({ error: 'Failed to fetch campaigns' });
        }
        return res.status(200).json(campaigns || []);
      }

      case 'POST': {
        const { name, description, status, start_date, end_date, budget, target_audience } = req.body;
        
        if (!name || !status) {
          return res.status(400).json({ error: 'Name and status are required' });
        }

        const newCampaign = {
          user_id: userId,
          name,
          description,
          status,
          start_date,
          end_date,
          budget,
          target_audience
        };

        const { data: campaign, error } = await supabase
          .from('campaigns')
          .insert(newCampaign)
          .select()
          .single();

        if (error) {
          console.error('Error creating campaign:', error);
          return res.status(500).json({ error: 'Failed to create campaign' });
        }
        return res.status(201).json(campaign);
      }

      case 'PUT': {
        const { id, ...updateData } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Campaign ID is required' });
        }

        const { data: campaign, error } = await supabase
          .from('campaigns')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) {
          console.error('Error updating campaign:', error);
          return res.status(500).json({ error: 'Failed to update campaign' });
        }
        return res.status(200).json(campaign);
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 