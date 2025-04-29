import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .limit(1);

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Database test error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to connect to database' 
    });
  }
} 