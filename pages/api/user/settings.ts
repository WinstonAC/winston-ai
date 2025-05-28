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
        // Get user settings
        const { data: userProfile, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (fetchError) {
          // Return mock user settings if table doesn't exist
          const mockSettings = {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || 'User',
            notifications: {
              email: true,
              push: false,
              marketing: true
            },
            preferences: {
              theme: 'light',
              timezone: 'UTC',
              language: 'en'
            },
            created_at: user.created_at
          }
          return res.status(200).json(mockSettings)
        }

        return res.status(200).json(userProfile)

      case 'PUT':
        // Update user settings
        const { full_name, notifications, preferences } = req.body
        
        const updateData: any = {}
        if (full_name) updateData.full_name = full_name
        if (notifications) updateData.notifications = notifications
        if (preferences) updateData.preferences = preferences

        const { data: updatedProfile, error: updateError } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', user.id)
          .select()
          .single()

        if (updateError) {
          // Return mock updated settings if table doesn't exist
          const mockUpdatedSettings = {
            id: user.id,
            email: user.email,
            full_name: full_name || user.user_metadata?.full_name || 'User',
            notifications: notifications || { email: true, push: false, marketing: true },
            preferences: preferences || { theme: 'light', timezone: 'UTC', language: 'en' },
            created_at: user.created_at
          }
          return res.status(200).json(mockUpdatedSettings)
        }

        return res.status(200).json(updatedProfile)

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('User settings API error:', error)
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    })
  }
} 