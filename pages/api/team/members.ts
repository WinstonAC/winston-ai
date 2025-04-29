import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: Replace with real user ID from Supabase Auth session
  const userId = req.query.userId as string || 'demo-user-id';

  if (req.method === 'GET') {
    // Fetch user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (userError) return res.status(500).json({ error: userError.message });

    // Fetch members
    const { data: members, error: membersError } = await supabase
      .from('users')
      .select('*')
      .eq('teamId', user.teamId);
    if (membersError) return res.status(500).json({ error: membersError.message });

    // Fetch invites
    const { data: invites, error: invitesError } = await supabase
      .from('teamInvites')
      .select('*')
      .eq('teamId', user.teamId);
    if (invitesError) return res.status(500).json({ error: invitesError.message });

    return res.status(200).json({ user, members, invites });
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 