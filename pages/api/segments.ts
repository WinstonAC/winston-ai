import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: Replace with real user ID from Supabase Auth session
  const userId = req.query.userId as string || 'demo-user-id';

  if (req.method === 'GET') {
    // List all segments for user
    const { data: segments, error } = await supabase
      .from('segments')
      .select('*')
      .eq('userId', userId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(segments || []);
  }

  if (req.method === 'POST') {
    // Create a new segment
    const newSegment = { ...req.body, userId };
    const { data: segment, error } = await supabase
      .from('segments')
      .insert(newSegment)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(segment);
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 