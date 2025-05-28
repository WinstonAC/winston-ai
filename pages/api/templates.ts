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
        // Return mock templates for MVP
        const mockTemplates = [
          {
            id: '1',
            name: 'Welcome Email',
            subject: 'Welcome to {{company_name}}!',
            body: 'Hi {{first_name}},\n\nWelcome to our platform! We\'re excited to have you on board.\n\nBest regards,\nThe Team',
            created_at: new Date().toISOString(),
            user_id: user.id
          },
          {
            id: '2',
            name: 'Follow-up Email',
            subject: 'Following up on our conversation',
            body: 'Hi {{first_name}},\n\nI wanted to follow up on our recent conversation about {{topic}}.\n\nLet me know if you have any questions!\n\nBest,\n{{sender_name}}',
            created_at: new Date().toISOString(),
            user_id: user.id
          }
        ]

        return res.status(200).json(mockTemplates)

      case 'POST':
        // Create new template (mock for MVP)
        const { name, subject, body } = req.body
        
        if (!name || !subject || !body) {
          return res.status(400).json({ error: 'Name, subject, and body are required' })
        }

        const newTemplate = {
          id: Date.now().toString(),
          name,
          subject,
          body,
          created_at: new Date().toISOString(),
          user_id: user.id
        }

        return res.status(201).json(newTemplate)

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Templates API error:', error)
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    })
  }
} 