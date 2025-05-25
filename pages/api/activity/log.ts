import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, { providers: [] });
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { type, description, teamId, leadId } = req.body;

    if (!type || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const activity = {
      id: '1',
      type,
      description,
      leadId,
      userId: session.user.id,
      teamId: teamId as string,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return res.status(200).json(activity);
  } catch (error) {
    console.error('Error logging activity:', error);
    return res.status(500).json({ error: 'Failed to log activity' });
  }
} 