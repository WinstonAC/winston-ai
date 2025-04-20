export type UserRole = 'admin' | 'manager' | 'user';
export type DataAccessLevel = 'own' | 'team' | 'department' | 'organization';
export type PlanType = 'free' | 'pro' | 'enterprise';

export interface UsageLimits {
  maxExportsPerMonth: number;
  maxCampaignsToCompare: number;
  maxCustomReports: number;
  maxScheduledExports: number;
  dataRetentionPeriod: number;
}

export interface TeamPermissions {
  canViewTeamMetrics: boolean;
  canShareReports: boolean;
  canCollaborateOnAnnotations: boolean;
  canCreateTeamDashboards: boolean;
}

export interface AnalyticsPermissions {
  // Basic Features
  canViewDashboard: boolean;
  canViewBasicCharts: boolean;
  canViewOwnCampaigns: boolean;
  
  // Intermediate Features
  canExportData: boolean;
  canCompareCampaigns: boolean;
  canViewRealTimeData: boolean;
  canViewTeamCampaigns: boolean;
  
  // Advanced Features
  canManageAnnotations: boolean;
  canAccessAdvancedCharts: boolean;
  canCreateCustomReports: boolean;
  canScheduleExports: boolean;
  
  // Admin Features
  canManageTeamAccess: boolean;
  canViewAllCampaigns: boolean;
  canAuditLogs: boolean;

  // Data Access
  dataAccessLevel: DataAccessLevel;
  
  // Usage Limits
  usageLimits: UsageLimits;
  
  // Team Features
  teamPermissions: TeamPermissions;
}

export const getDefaultUsageLimits = (plan: PlanType): UsageLimits => {
  switch (plan) {
    case 'free':
      return {
        maxExportsPerMonth: 5,
        maxCampaignsToCompare: 2,
        maxCustomReports: 0,
        maxScheduledExports: 0,
        dataRetentionPeriod: 30,
      };
    case 'pro':
      return {
        maxExportsPerMonth: 50,
        maxCampaignsToCompare: 5,
        maxCustomReports: 5,
        maxScheduledExports: 5,
        dataRetentionPeriod: 90,
      };
    case 'enterprise':
      return {
        maxExportsPerMonth: 1000,
        maxCampaignsToCompare: 20,
        maxCustomReports: 50,
        maxScheduledExports: 50,
        dataRetentionPeriod: 365,
      };
  }
};

export const getDefaultTeamPermissions = (role: UserRole): TeamPermissions => {
  switch (role) {
    case 'admin':
      return {
        canViewTeamMetrics: true,
        canShareReports: true,
        canCollaborateOnAnnotations: true,
        canCreateTeamDashboards: true,
      };
    case 'manager':
      return {
        canViewTeamMetrics: true,
        canShareReports: true,
        canCollaborateOnAnnotations: true,
        canCreateTeamDashboards: false,
      };
    case 'user':
      return {
        canViewTeamMetrics: false,
        canShareReports: false,
        canCollaborateOnAnnotations: false,
        canCreateTeamDashboards: false,
      };
  }
};

export const getAnalyticsPermissions = (user: User): AnalyticsPermissions => {
  const basePermissions: AnalyticsPermissions = {
    // Basic Features
    canViewDashboard: true,
    canViewBasicCharts: true,
    canViewOwnCampaigns: true,
    
    // Intermediate Features
    canExportData: false,
    canCompareCampaigns: false,
    canViewRealTimeData: false,
    canViewTeamCampaigns: false,
    
    // Advanced Features
    canManageAnnotations: false,
    canAccessAdvancedCharts: false,
    canCreateCustomReports: false,
    canScheduleExports: false,
    
    // Admin Features
    canManageTeamAccess: false,
    canViewAllCampaigns: false,
    canAuditLogs: false,

    // Data Access
    dataAccessLevel: 'own',
    
    // Usage Limits
    usageLimits: getDefaultUsageLimits(user.plan),
    
    // Team Features
    teamPermissions: getDefaultTeamPermissions(user.role),
  };

  // Plan-based permissions
  if (user.plan === 'pro' || user.plan === 'enterprise') {
    basePermissions.canExportData = true;
    basePermissions.canCompareCampaigns = true;
    basePermissions.canViewRealTimeData = true;
    basePermissions.canViewTeamCampaigns = true;
    basePermissions.dataAccessLevel = 'team';
  }

  if (user.plan === 'enterprise') {
    basePermissions.canManageAnnotations = true;
    basePermissions.canAccessAdvancedCharts = true;
    basePermissions.canCreateCustomReports = true;
    basePermissions.canScheduleExports = true;
  }

  // Role-based permissions
  if (user.role === 'admin') {
    basePermissions.canManageTeamAccess = true;
    basePermissions.canViewAllCampaigns = true;
    basePermissions.canAuditLogs = true;
    basePermissions.dataAccessLevel = 'organization';
  }

  if (user.role === 'manager') {
    basePermissions.canViewTeamCampaigns = true;
    basePermissions.dataAccessLevel = 'department';
  }

  return basePermissions;
}; 