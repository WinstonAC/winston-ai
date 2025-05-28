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

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    // Return mock dashboard stats for MVP
    const mockStats = {
      totalLeads: 127,
      activeCampaigns: 3,
      emailsSent: 1250,
      responseRate: 12.5,
      recentActivity: [
        {
          id: '1',
          type: 'campaign_created',
          message: 'New campaign "Welcome Series" created',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'lead_added',
          message: '15 new leads imported',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'email_sent',
          message: 'Campaign email sent to 50 leads',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        }
      ],
      chartData: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Emails Sent',
            data: [12, 19, 3, 5, 2, 3, 9],
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
          }
        ]
      }
    }

    return res.status(200).json(mockStats)
  } catch (error) {
    console.error('Dashboard stats API error:', error)
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    })
  }
} 