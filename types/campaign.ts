export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'completed' | 'failed';

export interface CampaignMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  templateId: string;
  targetAudience: {
    segment: string;
    filters: Record<string, any>;
  };
  schedule: {
    type: 'immediate' | 'scheduled';
    date?: string;
    time?: string;
  };
  status: CampaignStatus;
  metrics?: CampaignMetrics;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
}

export interface Segment {
  id: string;
  name: string;
  description?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  title: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
}

export type CreateCampaignInput = Omit<Campaign, 'id' | 'status' | 'metrics' | 'createdAt' | 'updatedAt'>;
export type UpdateCampaignInput = Partial<CreateCampaignInput>;

export interface CampaignCreatorProps {
  leads: Lead[];
  templates: EmailTemplate[];
  segments: Segment[];
  onCreateCampaign: (campaign: CreateCampaignInput) => Promise<void>;
  onUpdateCampaign: (id: string, campaign: UpdateCampaignInput) => Promise<void>;
  onDeleteCampaign: (id: string) => Promise<void>;
} 