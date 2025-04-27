import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Get user's team
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { team: true },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const leads = await prisma.lead.findMany({
          where: {
            OR: [
              { userId: session.user.id },
              user.team ? { teamId: user.team.id } : {},
            ],
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
        return res.status(200).json(leads);
      } catch (error) {
        console.error('Error fetching leads:', error);
        return res.status(500).json({ error: 'Failed to fetch leads' });
      }

    case 'POST':
      try {
        const leadsData = Array.isArray(req.body) ? req.body : [req.body];
        
        const createdLeads = await Promise.all(
          leadsData.map(lead => 
            prisma.lead.create({
              data: {
                name: lead.name,
                email: lead.email,
                status: lead.status || 'Pending',
                classification: lead.classification,
                userId: session.user.id,
                teamId: user.team?.id, // Optional team association
              },
            })
          )
        );

        return res.status(201).json(createdLeads);
      } catch (error) {
        console.error('Error creating leads:', error);
        return res.status(500).json({ error: 'Failed to create leads' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 