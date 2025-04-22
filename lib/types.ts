export enum TeamPermission {
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin',
  DELETE = 'delete',
  INVITE = 'invite'
}

export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member',
  GUEST = 'guest'
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  teamId?: string;
  permissions: TeamPermission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  members: User[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  teamId: string;
  createdBy: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  metrics?: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Lead {
  id: string;
  email: string;
  name?: string;
  company?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source?: string;
  campaignId?: string;
  teamId: string;
  assignedTo?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
} 