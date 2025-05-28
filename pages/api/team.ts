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
        // Return mock team data for MVP
        const mockTeam = {
          id: '1',
          name: 'Winston AI Team',
          members: [
            {
              id: user.id,
              name: user.user_metadata?.full_name || 'User',
              email: user.email,
              role: 'admin',
              joined_at: new Date().toISOString()
            }
          ],
          created_at: new Date().toISOString(),
          plan: 'free'
        }

        return res.status(200).json(mockTeam)

      case 'POST':
        // Create team (mock for MVP)
        const { name } = req.body
        
        if (!name) {
          return res.status(400).json({ error: 'Team name is required' })
        }

        const newTeam = {
          id: Date.now().toString(),
          name,
          members: [
            {
              id: user.id,
              name: user.user_metadata?.full_name || 'User',
              email: user.email,
              role: 'admin',
              joined_at: new Date().toISOString()
            }
          ],
          created_at: new Date().toISOString(),
          plan: 'free'
        }

        return res.status(201).json(newTeam)

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Team API error:', error)
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    })
  }
} 