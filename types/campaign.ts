import { Lead } from './lead';
import { Template } from './template';
import { Segment } from '@/types/segment';

export interface Campaign {
  id: string;
  name: string;
  description: string;
  templateId: string;
  segmentId: string;
  targetAudience?: {
    segment: string;
    filters: Record<string, unknown>;
  };
  schedule: {
    type: 'immediate' | 'scheduled';
    date?: string;
    time?: string;
    timezone?: string;
  };
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed';
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
    filters: Record<string, unknown>;
  };
  schedule: {
    type: 'immediate' | 'scheduled';
    date?: string;
    time?: string;
    timezone?: string;
  };
}

export interface UpdateCampaignInput extends Partial<CreateCampaignInput> {
  id: string;
}

export interface CampaignCreatorProps {
  leads: Lead[];
  templates: Template[];
  segments: Segment[];
  onCreateCampaign?: (input: CreateCampaignInput) => Promise<void>;
  onUpdateCampaign?: (input: UpdateCampaignInput) => Promise<void>;
  onDeleteCampaign?: (id: string) => Promise<void>;
} 