export interface Campaign {
  id: string;
  name: string;
  description: string;
  templateId: string;
  segmentId: string;
  targetAudience?: {
    segment: string;
    filters: Record<string, any>;
  };
  schedule?: {
    type: 'immediate' | 'scheduled';
    date?: string;
    time?: string;
  };
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCampaignInput {
  name: string;
  description: string;
  templateId: string;
  segmentId: string;
  targetAudience: {
    segment: string;
    filters: Record<string, any>;
  };
  schedule: {
    type: 'immediate' | 'scheduled';
    date?: string;
    time?: string;
  };
}

export interface UpdateCampaignInput extends Partial<CreateCampaignInput> {
  id: string;
}

export interface CampaignCreatorProps {
  leads: any[]; // Replace with proper Lead type
  templates: any[]; // Replace with proper Template type
  segments: any[]; // Replace with proper Segment type
  onCreateCampaign?: (input: CreateCampaignInput) => Promise<void>;
  onUpdateCampaign?: (input: UpdateCampaignInput) => Promise<void>;
  onDeleteCampaign?: (id: string) => Promise<void>;
} 