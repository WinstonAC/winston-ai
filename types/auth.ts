export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum TeamPermission {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  password?: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  teamId?: string | null;
  teamRole?: TeamPermission | null;
}

export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}

export interface UserSettings {
  id: string;
  userId: string;
  emailSignature?: string | null;
  defaultTemplate?: string | null;
  templates?: any; // JSON type
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageLimits {
  maxExportsPerMonth: number;
  maxCampaignsToCompare: number;
  maxCustomReports: number;
  maxScheduledExports: number;
  dataRetentionPeriod: number;
}

export interface AnalyticsPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  canExportData: boolean;
  canCompareCampaigns: boolean;
  canManageAnnotations: boolean;
  canAccessAdvancedCharts: boolean;
  usageLimits: UsageLimits;
  dataAccessLevel: 'own' | 'team' | 'department' | 'organization';
}

export function getAnalyticsPermissions(user: User): AnalyticsPermissions {
  const defaultLimits: UsageLimits = {
    maxExportsPerMonth: 50,
    maxCampaignsToCompare: 5,
    maxCustomReports: 10,
    maxScheduledExports: 3,
    dataRetentionPeriod: 30,
  };

  if (!user) {
    return {
      canView: false,
      canEdit: false,
      canDelete: false,
      canShare: false,
      canExportData: false,
      canCompareCampaigns: false,
      canManageAnnotations: false,
      canAccessAdvancedCharts: false,
      usageLimits: defaultLimits,
      dataAccessLevel: 'own',
    };
  }

  // Admin has all permissions with higher limits
  if (user.role === UserRole.ADMIN) {
    return {
      canView: true,
      canEdit: true,
      canDelete: true,
      canShare: true,
      canExportData: true,
      canCompareCampaigns: true,
      canManageAnnotations: true,
      canAccessAdvancedCharts: true,
      usageLimits: {
        ...defaultLimits,
        maxExportsPerMonth: 1000,
        maxCampaignsToCompare: 20,
        maxCustomReports: 50,
        maxScheduledExports: 10,
        dataRetentionPeriod: 90,
      },
      dataAccessLevel: 'organization',
    };
  }

  // Regular user has limited permissions
  return {
    canView: true,
    canEdit: false,
    canDelete: false,
    canShare: false,
    canExportData: true,
    canCompareCampaigns: true,
    canManageAnnotations: false,
    canAccessAdvancedCharts: false,
    usageLimits: defaultLimits,
    dataAccessLevel: user.teamId ? 'team' : 'own',
  };
}
