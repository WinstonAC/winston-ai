import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const assets = await prisma.templateAsset.findMany({
          where: {
            template: {
              createdBy: session.user.id,
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
        return res.status(200).json(assets);
      } catch (error) {
        console.error('Error fetching assets:', error);
        return res.status(500).json({ error: 'Failed to fetch assets' });
      }

    case 'POST':
      try {
        const { type, url, name, size, mimeType, templateId } = req.body;

        const asset = await prisma.templateAsset.create({
          data: {
            type,
            url,
            name,
            size,
            mimeType,
            templateId,
          },
        });

        return res.status(201).json(asset);
      } catch (error) {
        console.error('Error creating asset:', error);
        return res.status(500).json({ error: 'Failed to create asset' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 