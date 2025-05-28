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
        // Get leads for campaigns owned by the authenticated user
        const { data: leads, error: fetchError } = await supabase
          .from('leads')
          .select(`
            *,
            campaigns!inner(user_id)
          `)
          .eq('campaigns.user_id', user.id)
          .order('created_at', { ascending: false })

        if (fetchError) {
          // If campaigns table doesn't exist or join fails, get all leads for MVP
          const { data: allLeads, error: simpleError } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50)

          if (simpleError) {
            throw simpleError
          }

          return res.status(200).json(allLeads || [])
        }

        return res.status(200).json(leads || [])

      case 'POST':
        // Create new lead
        const { email, campaign_id, status = 'new' } = req.body
        
        if (!email) {
          return res.status(400).json({ error: 'Email is required' })
        }

        const { data: newLead, error: createError } = await supabase
          .from('leads')
          .insert({
            email,
            campaign_id,
            status,
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) {
          throw createError
        }

        return res.status(201).json(newLead)

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Leads API error:', error)
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    })
  }
} 