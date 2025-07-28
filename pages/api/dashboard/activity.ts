import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Demo user - bypass authentication
    const user = { id: "demo-user-123" };

    // Fetch recent leads and analytics events
    const [leadsResult, analyticsResult] = await Promise.all([
      supabase
        .from('leads')
        .select('id, full_name, created_at, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    if (leadsResult.error) {
      console.error('Error fetching leads:', leadsResult.error);
    }

    if (analyticsResult.error) {
      console.error('Error fetching analytics:', analyticsResult.error);
    }

    // Combine and format activity data
    const activities: Array<{
      id: string;
      type: string;
      leadName: string;
      createdAt: string;
      status?: string;
      details?: any;
    }> = [];

    // Add lead activities
    if (leadsResult.data) {
      leadsResult.data.forEach(lead => {
        activities.push({
          id: `lead-${lead.id}`,
          type: 'lead_created',
          leadName: lead.full_name,
          createdAt: lead.created_at,
          status: lead.status
        });
      });
    }

    // Add analytics activities
    if (analyticsResult.data) {
      analyticsResult.data.forEach(event => {
        const eventData = event.event_data ? JSON.parse(event.event_data) : {};
        activities.push({
          id: `analytics-${event.id}`,
          type: event.event_type,
          leadName: eventData.lead_id ? `Lead ${eventData.lead_id}` : 'System',
          createdAt: event.created_at,
          details: eventData
        });
      });
    }

    // Sort by creation date and limit to 10 most recent
    const sortedActivities = activities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    // If no real data, return demo activity
    if (sortedActivities.length === 0) {
      return res.status(200).json([
        {
          id: '1',
          type: 'lead_created',
          leadName: 'John Doe',
          createdAt: new Date().toISOString(),
          status: 'new'
        },
        {
          id: '2',
          type: 'email_sent',
          leadName: 'Jane Smith',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          status: 'contacted'
        },
        {
          id: '3',
          type: 'lead_converted',
          leadName: 'Mike Johnson',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          status: 'converted'
        }
      ]);
    }

    return res.status(200).json(sortedActivities);
  } catch (error) {
    console.error('Dashboard activity error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch dashboard activity',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 