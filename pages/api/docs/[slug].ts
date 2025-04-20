import { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;
  
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Invalid slug' });
  }

  try {
    const filePath = path.join(process.cwd(), 'docs', `${slug}.md`);
    const content = await fs.readFile(filePath, 'utf8');
    
    res.setHeader('Content-Type', 'text/markdown');
    res.status(200).send(content);
  } catch (error) {
    res.status(404).json({ error: 'Document not found' });
  }
} 