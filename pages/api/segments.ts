import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check authentication
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    switch (req.method) {
      case 'GET':
        // Return mock segments for MVP
        const mockSegments = [
          {
            id: '1',
            name: 'New Leads',
            description: 'Leads that have not been contacted yet',
            criteria: { status: 'new' },
            count: 25,
            created_at: new Date().toISOString(),
            user_id: user.id
          },
          {
            id: '2',
            name: 'Engaged Prospects',
            description: 'Leads that have opened emails or clicked links',
            criteria: { status: 'engaged' },
            count: 12,
            created_at: new Date().toISOString(),
            user_id: user.id
          }
        ]

        return res.status(200).json(mockSegments)

      case 'POST':
        // Create new segment (mock for MVP)
        const { name, description, criteria } = req.body
        
        if (!name || !criteria) {
          return res.status(400).json({ error: 'Name and criteria are required' })
        }

        const newSegment = {
          id: Date.now().toString(),
          name,
          description: description || '',
          criteria,
          count: 0,
          created_at: new Date().toISOString(),
          user_id: user.id
        }

        return res.status(201).json(newSegment)

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Segments API error:', error)
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    })
  }
} 