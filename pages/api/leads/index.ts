import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const leads = await prisma.lead.findMany({
          where: {
            userId: session.user.id,
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
        const { name, email, status, classification } = req.body;
        const lead = await prisma.lead.create({
          data: {
            name,
            email,
            status,
            classification,
            userId: session.user.id,
          },
        });
        return res.status(201).json(lead);
      } catch (error) {
        console.error('Error creating lead:', error);
        return res.status(500).json({ error: 'Failed to create lead' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 