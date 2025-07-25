import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Demo user - bypass authentication for demo purposes
    const user = { id: "demo-user-123" }

    switch (req.method) {
      case 'GET':
        // Return demo campaigns data
        const demoCampaigns = [
          {
            id: '1',
            name: 'Q1 Outreach Campaign',
            description: 'Tech company outreach for Q1 2024',
            status: 'active',
            user_id: user.id,
            metrics: {
              sent: 150,
              delivered: 145,
              opened: 98,
              clicked: 24,
              bounced: 5,
              replied: 18,
              meetings: 6
            },
            createdAt: '2024-01-10T10:00:00Z',
            updatedAt: '2024-01-15T14:30:00Z'
          },
          {
            id: '2',
            name: 'SaaS Demo Campaign',
            description: 'Software demo requests campaign',
            status: 'completed',
            user_id: user.id,
            metrics: {
              sent: 75,
              delivered: 73,
              opened: 52,
              clicked: 15,
              bounced: 2,
              replied: 12,
              meetings: 4
            },
            createdAt: '2024-01-01T09:00:00Z',
            updatedAt: '2024-01-08T16:00:00Z'
          },
          {
            id: '3',
            name: 'Enterprise Leads',
            description: 'Large enterprise prospects',
            status: 'draft',
            user_id: user.id,
            createdAt: '2024-01-12T11:00:00Z',
            updatedAt: '2024-01-12T11:00:00Z'
          }
        ];

        return res.status(200).json({ campaigns: demoCampaigns })

      case 'POST':
        // For demo purposes, accept campaign creation but return mock data
        const { name, description, status = 'draft' } = req.body
        
        if (!name) {
          return res.status(400).json({ error: 'Campaign name is required' })
        }

        const newCampaign = {
          id: Date.now().toString(),
          name,
          description: description || '',
          status,
          user_id: user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        console.log('Demo: Created new campaign:', newCampaign)
        return res.status(201).json(newCampaign)

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Campaigns API error:', error)
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    })
  }
} 