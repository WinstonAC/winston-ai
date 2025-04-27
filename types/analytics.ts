export interface CampaignMetrics {
  id: string;
  campaignId: string;
  name: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  replies: number;
  meetings: number;
  impressions: number;
  conversions: number;
  revenue: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsData {
  dailyMetrics: {
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  }[];
  totalMetrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
  conversionRate: number;
  clickThroughRate: number;
  revenuePerConversion: number;
}

export interface PerformanceMetrics {
  id: string;
  userId: string;
  date: Date;
  emailsSent: number;
  emailsOpened: number;
  linksClicked: number;
  responses: number;
  meetings: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiMetrics {
  id: string;
  userId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
} 