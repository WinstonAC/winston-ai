export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'completed' | 'failed';

export interface CampaignMetrics {
  id: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  replied: number;
  meetings: number;
  createdAt: string;
  updatedAt: string;
}

export interface TargetAudience {
  id: string;
  segment: string;
  filters: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignSchedule {
  id: string;
  type: 'immediate' | 'scheduled';
  date?: string;
  time?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  templateId: string;
  segmentId?: string;
  segment?: Segment;
  status: CampaignStatus;
  userId: string;
  teamId?: string;
  targetAudience?: TargetAudience;
  schedule?: CampaignSchedule;
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

export type CreateCampaignInput = Omit<Campaign, 'id' | 'status' | 'metrics' | 'createdAt' | 'updatedAt' | 'targetAudience' | 'schedule' | 'segment'> & {
  segmentId?: string;
  targetAudience: Omit<TargetAudience, 'id' | 'createdAt' | 'updatedAt'>;
  schedule: Omit<CampaignSchedule, 'id' | 'createdAt' | 'updatedAt'>;
};

export type UpdateCampaignInput = Partial<CreateCampaignInput>;

export interface CampaignCreatorProps {
  leads: Lead[];
  templates: EmailTemplate[];
  segments: Segment[];
  onCreateCampaign: (campaign: CreateCampaignInput) => Promise<void>;
  onUpdateCampaign: (id: string, campaign: UpdateCampaignInput) => Promise<void>;
  onDeleteCampaign: (id: string) => Promise<void>;
} 