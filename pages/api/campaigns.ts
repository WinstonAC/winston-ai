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
        // Get campaigns for the authenticated user
        const { data: campaigns, error: fetchError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (fetchError) {
          throw fetchError
        }

        return res.status(200).json(campaigns || [])

      case 'POST':
        // Create new campaign
        const { name, status = 'draft' } = req.body
        
        if (!name) {
          return res.status(400).json({ error: 'Campaign name is required' })
        }

        const { data: newCampaign, error: createError } = await supabase
          .from('campaigns')
          .insert({
            user_id: user.id,
            name,
            status,
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) {
          throw createError
        }

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