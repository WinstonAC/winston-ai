import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // DEMO MODE: Mock user instead of checking auth
    const user = { id: 'demo-user-123' }

    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Campaign ID is required' })
    }

    switch (req.method) {
      case 'GET':
        // DEMO MODE: Return mock campaign data
        const mockCampaign = {
          id: id,
          name: `Demo Campaign ${id}`,
          status: 'active',
          description: 'This is a demo campaign for testing purposes',
          created_at: '2024-01-15T10:00:00Z',
          user_id: user.id,
          leads_count: 150,
          sent_count: 120,
          open_rate: 0.65,
          reply_rate: 0.18
        }

        return res.status(200).json(mockCampaign)

      case 'PUT':
        // DEMO MODE: Mock campaign update
        const { name, status } = req.body
        
        const updatedCampaign = {
          id: id,
          name: name || `Demo Campaign ${id}`,
          status: status || 'active',
          description: 'This is a demo campaign for testing purposes',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: new Date().toISOString(),
          user_id: user.id,
          leads_count: 150,
          sent_count: 120,
          open_rate: 0.65,
          reply_rate: 0.18
        }

        return res.status(200).json(updatedCampaign)

      case 'DELETE':
        // DEMO MODE: Mock campaign deletion
        return res.status(204).end()

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Campaign API error:', error)
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    })
  }
} 