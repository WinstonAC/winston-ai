export interface CampaignMetrics {
  id: string;
  name: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  replies: number;
  meetings: number;
  startDate: string;
  endDate: string;
}

export interface AnalyticsData {
  totalLeads: number;
  openRate: number;
  responseRate: number;
  meetings: number;
  recentActivity: {
    id: string;
    type: string;
    leadName: string;
    createdAt: string;
  }[];
  trends: {
    date: string;
    opens: number;
    clicks: number;
    responses: number;
  }[];
}

export type DataAccessLevel = 'own' | 'team' | 'department' | 'organization'; 