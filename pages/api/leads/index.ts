import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Demo user - bypass authentication for demo purposes
    const user = { id: "demo-user-123" }

    switch (req.method) {
      case 'GET':
        // Return demo leads data
        const demoLeads = [
          {
            id: '1',
            name: 'John Smith',
            email: 'john.smith@techcorp.com',
            company: 'TechCorp',
            title: 'CEO',
            status: 'new',
            lastContacted: '2024-01-15',
            created_at: '2024-01-15T10:00:00Z'
          },
          {
            id: '2',
            name: 'Sarah Johnson',
            email: 'sarah.j@innovateio.com',
            company: 'InnovateIO',
            title: 'CTO',
            status: 'contacted',
            lastContacted: '2024-01-14',
            created_at: '2024-01-14T15:30:00Z'
          },
          {
            id: '3',
            name: 'Mike Chen',
            email: 'mike@futuretech.ai',
            company: 'FutureTech AI',
            title: 'Founder',
            status: 'qualified',
            lastContacted: '2024-01-13',
            created_at: '2024-01-13T09:15:00Z'
          },
          {
            id: '4',
            name: 'Emily Davis',
            email: 'emily.davis@startuphub.com',
            company: 'StartupHub',
            title: 'Product Manager',
            status: 'new',
            created_at: '2024-01-12T14:20:00Z'
          }
        ];

        return res.status(200).json(demoLeads)

      case 'POST':
        // For demo purposes, accept the POST but just return success
        const { leads: leadsArray, email, name, status = 'new' } = req.body
        
        if (leadsArray && Array.isArray(leadsArray)) {
          // Bulk upload from CSV
          console.log(`Demo: Received ${leadsArray.length} leads for upload`)
          return res.status(201).json({ 
            message: `Successfully uploaded ${leadsArray.length} leads`,
            count: leadsArray.length 
          })
        } else if (email) {
          // Single lead creation
          const newLead = {
            id: Date.now().toString(),
            email,
            name: name || 'Unknown',
            status,
            created_at: new Date().toISOString()
          }
          console.log('Demo: Created new lead:', newLead)
          return res.status(201).json(newLead)
        } else {
          return res.status(400).json({ error: 'Email is required' })
        }

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