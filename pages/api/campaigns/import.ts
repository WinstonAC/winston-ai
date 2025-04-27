import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { parse } from 'csv-parse/sync';
import { prisma } from '@/lib/prisma';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const csvData = req.body;
    if (!csvData) {
      return res.status(400).json({ error: 'No CSV data provided' });
    }

    // Parse CSV data
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
    });

    // Validate required fields
    const requiredFields = ['name', 'description', 'startDate', 'endDate', 'budget', 'status'];
    const missingFields = records.some((record: any) => 
      requiredFields.some(field => !record[field])
    );

    if (missingFields) {
      return res.status(400).json({ error: 'Missing required fields in CSV' });
    }

    // Process records and create campaigns
    const campaigns = await Promise.all(
      records.map(async (record: any) => {
        return await prisma.campaign.create({
          data: {
            name: record.name,
            description: record.description,
            type: 'email',
            status: record.status || 'draft',
            schedule: {
              create: {
                type: 'scheduled',
                date: new Date(record.startDate),
                time: record.startTime || '09:00'
              }
            },
            user: {
              connect: { id: session.user.id }
            },
            createdAt: new Date(),
            updatedAt: new Date()
          },
        });
      })
    );

    return res.status(200).json({ 
      message: `Successfully imported ${campaigns.length} campaigns`,
      campaigns 
    });
  } catch (error) {
    console.error('Campaign import error:', error);
    return res.status(500).json({ 
      error: 'Failed to import campaigns',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 