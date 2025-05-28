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

    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Campaign ID is required' })
    }

    switch (req.method) {
      case 'GET':
        // Get specific campaign
        const { data: campaign, error: fetchError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single()

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            return res.status(404).json({ error: 'Campaign not found' })
          }
          throw fetchError
        }

        return res.status(200).json(campaign)

      case 'PUT':
        // Update campaign
        const { name, status } = req.body
        
        const updateData: any = {}
        if (name) updateData.name = name
        if (status) updateData.status = status

        const { data: updatedCampaign, error: updateError } = await supabase
          .from('campaigns')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single()

        if (updateError) {
          if (updateError.code === 'PGRST116') {
            return res.status(404).json({ error: 'Campaign not found' })
          }
          throw updateError
        }

        return res.status(200).json(updatedCampaign)

      case 'DELETE':
        // Delete campaign
        const { error: deleteError } = await supabase
          .from('campaigns')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)

        if (deleteError) {
          throw deleteError
        }

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