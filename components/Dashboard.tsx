import React from 'react';
import { 
  ChartBarIcon, 
  EnvelopeIcon, 
  CalendarIcon, 
  UserGroupIcon, 
  ArrowTrendingUpIcon,
  BeakerIcon,
  DocumentTextIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import SandboxSettings from './SandboxSettings';
import { useRouter } from 'next/router';

interface DashboardProps {
  stats: {
    totalLeads: number;
    openRate: number;
    responseRate: number;
    meetings: number;
  };
  recentActivity: {
    id: string;
    type: string;
    leadName: string;
    createdAt: string;
  }[];
  isSandbox?: boolean;
  onSandboxReset?: () => void;
  onSandboxSettingsUpdate?: (settings: any) => void;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ElementType;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon }) => (
  <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-2xl font-light text-white mt-2">{value}</p>
        {change && (
          <p className="text-green-400 text-sm mt-2 flex items-center">
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            {change}
          </p>
        )}
      </div>
      <div className="bg-gray-800 p-3 rounded-lg">
        <Icon className="w-6 h-6 text-gray-400" />
      </div>
    </div>
  </div>
);

const ActivityFeed: React.FC<{ activities: DashboardProps['recentActivity'] }> = ({ activities }) => (
  <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 mt-8">
    <h3 className="text-lg font-medium text-white mb-6">Recent Activity</h3>
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {activities.map((activity, activityIdx) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {activityIdx !== activities.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-800"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center ring-8 ring-gray-900">
                    {activity.type === 'opened' && <EnvelopeIcon className="h-5 w-5 text-white" />}
                    {activity.type === 'clicked' && <ChartBarIcon className="h-5 w-5 text-white" />}
                    {activity.type === 'booked' && <CalendarIcon className="h-5 w-5 text-white" />}
                    {activity.type === 'new' && <UserGroupIcon className="h-5 w-5 text-white" />}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div>
                    <div className="text-sm text-white">
                      {activity.leadName}{' '}
                      <span className="text-gray-400">
                        {activity.type === 'opened' && 'opened the email'}
                        {activity.type === 'clicked' && 'clicked a link'}
                        {activity.type === 'booked' && 'booked a meeting'}
                        {activity.type === 'new' && 'was added as a lead'}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-400">
                      {new Date(activity.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const QuickActions: React.FC<{ isSandbox?: boolean }> = ({ isSandbox }) => {
  const router = useRouter();

  const handleNewCampaign = () => {
    router.push('/campaigns/new');
  };

  const handleImportLeads = () => {
    router.push('/leads/import');
  };

  const handleScheduleMeeting = () => {
    router.push('/meetings/schedule');
  };

  const handleViewReports = () => {
    router.push('/analytics');
  };

  const handleResetData = async () => {
    try {
      const response = await fetch('/api/sandbox/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reset data');
      }

      // Refresh the page to show updated data
      router.reload();
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  };

  const actions = [
    { text: 'New Campaign', color: 'bg-blue-500', onClick: handleNewCampaign },
    { text: 'Import Leads', color: 'bg-purple-500', onClick: handleImportLeads },
    { text: 'Schedule Meeting', color: 'bg-green-500', onClick: handleScheduleMeeting },
    { text: 'View Reports', color: 'bg-yellow-500', onClick: handleViewReports },
  ];

  if (isSandbox) {
    actions.push(
      { text: 'Reset Data', color: 'bg-red-500', onClick: handleResetData }
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <h3 className="text-lg font-light text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            className={`${action.color} bg-opacity-10 hover:bg-opacity-20 text-white p-4 rounded-lg text-sm font-medium transition-colors`}
            onClick={action.onClick}
          >
            {action.text}
          </button>
        ))}
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ 
  stats, 
  recentActivity, 
  isSandbox = false,
  onSandboxReset,
  onSandboxSettingsUpdate
}) => {
  return (
    <div className="space-y-6">
      {/* Sandbox Indicator */}
      {isSandbox && (
        <div className="flex items-center justify-center bg-blue-900 bg-opacity-20 border border-blue-800 rounded-lg p-4">
          <BeakerIcon className="h-5 w-5 text-blue-400 mr-2" />
          <span className="text-blue-400">Sandbox Mode Active</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Leads"
          value={stats.totalLeads}
          change="+12% from last month"
          icon={UserGroupIcon}
        />
        <StatCard
          title="Open Rate"
          value={`${stats.openRate}%`}
          change="+5% from last week"
          icon={EnvelopeIcon}
        />
        <StatCard
          title="Response Rate"
          value={`${stats.responseRate}%`}
          change="+8% from last week"
          icon={ChartBarIcon}
        />
        <StatCard
          title="Meetings Booked"
          value={stats.meetings}
          change="+3 from last week"
          icon={CalendarIcon}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <ActivityFeed activities={recentActivity} />
        </div>
        {/* Sidebar */}
        <div className="space-y-6">
          <QuickActions isSandbox={isSandbox} />
          {isSandbox && onSandboxSettingsUpdate && (
            <SandboxSettings onUpdate={onSandboxSettingsUpdate} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 