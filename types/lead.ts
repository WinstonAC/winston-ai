export interface Lead {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'unsubscribed';
  classification?: string;
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
  teamId?: string;
  userId: string;
  metadata?: Record<string, unknown>;
} 