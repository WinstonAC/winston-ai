import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import formidable from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const form = formidable({
      uploadDir: path.join(process.cwd(), 'public', 'uploads'),
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create a unique filename
    const uniqueFilename = `${Date.now()}-${file.originalFilename}`;
    const newPath = path.join(process.cwd(), 'public', 'uploads', uniqueFilename);
    await fs.rename(file.filepath, newPath);

    // Create asset record in database
    const asset = await prisma.templateAsset.create({
      data: {
        type: file.mimetype?.startsWith('image/') ? 'image' : 'video',
        url: `/uploads/${uniqueFilename}`,
        name: file.originalFilename || 'Untitled',
        size: file.size,
        mimeType: file.mimetype || 'application/octet-stream',
        templateId: fields.templateId?.[0] || null,
      },
    });

    return res.status(201).json(asset);
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ error: 'Failed to upload file' });
  }
} 