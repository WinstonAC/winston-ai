import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const templates = await prisma.template.findMany({
        where: {
          OR: [
            { createdBy: session.user.id },
            { isPublic: true },
            {
              sharedWith: {
                some: {
                  userId: session.user.id,
                },
              },
            },
          ],
        },
        include: {
          sharedWith: true,
          assets: true,
        },
      });

      return res.status(200).json(templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      return res.status(500).json({ error: 'Failed to fetch templates' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, subject, body, isPublic } = req.body;

      if (!name || !subject || !body) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const template = await prisma.template.create({
        data: {
          name,
          subject,
          body,
          isPublic: isPublic || false,
          createdBy: session.user.id,
        },
      });

      return res.status(201).json(template);
    } catch (error) {
      console.error('Error creating template:', error);
      return res.status(500).json({ error: 'Failed to create template' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 