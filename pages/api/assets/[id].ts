import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import path from 'path';
import { promises as fs } from 'fs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      // Get the asset to find its file path
      const asset = await prisma.templateAsset.findUnique({
        where: { id: id as string },
      });

      if (!asset) {
        return res.status(404).json({ error: 'Asset not found' });
      }

      // Delete the file from the filesystem
      const filePath = path.join(process.cwd(), 'public', asset.url);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
        // Continue with database deletion even if file deletion fails
      }

      // Delete the asset from the database
      await prisma.templateAsset.delete({
        where: { id: id as string },
      });

      return res.status(200).json({ message: 'Asset deleted successfully' });
    } catch (error) {
      console.error('Error deleting asset:', error);
      return res.status(500).json({ error: 'Failed to delete asset' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 