import React, { useRef, useState, useEffect } from 'react';
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
import Papa from 'papaparse';

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

interface Lead {
  id: string;
  name: string;
  email: string;
  status: string;
  classification: string | null;
  sent_at?: string;
  created_at: string;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNewCampaign = () => {
    router.push('/campaigns/new');
  };

  const handleImportLeads = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const results = await new Promise((resolve, reject) => {
        Papa.parse(file, {
          complete: resolve,
          error: reject,
          header: true,
        });
      });

      const parsedLeads = (results as any).data
        .filter((row: any) => row.name && row.email)
        .map((row: any) => ({
          name: row.name,
          email: row.email,
          status: 'Pending',
          classification: null,
        }));

      if (parsedLeads.length === 0) {
        throw new Error('No valid leads found in CSV. Please ensure your CSV has "name" and "email" columns.');
      }

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedLeads),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload leads');
      }

      window.location.reload();
    } catch (error) {
      console.error('Error processing CSV:', error);
      alert(error instanceof Error ? error.message : 'Failed to process CSV file. Please check the format and try again.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

      router.reload();
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  };

  const actions = [
    { text: 'NEW CAMPAIGN', onClick: handleNewCampaign },
    { text: 'IMPORT LEADS', onClick: handleImportLeads },
    { text: 'SCHEDULE MEETING', onClick: handleScheduleMeeting },
    { text: 'VIEW REPORTS', onClick: handleViewReports },
  ];

  if (isSandbox) {
    actions.push(
      { text: 'RESET DATA', onClick: handleResetData }
    );
  }

  return (
    <div className="bg-black border border-gray-800">
      <div className="p-6">
        <h3 className="font-mono text-gray-300 mb-6 tracking-widest uppercase text-sm">QUICK ACTIONS</h3>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="border border-gray-700 p-4 font-mono text-xs tracking-widest
                       text-gray-400 uppercase bg-black
                       hover:border-gray-600 hover:text-gray-300 transition-colors"
            >
              {action.text}
            </button>
          ))}
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileUpload}
      />
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leads');
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const results = await new Promise((resolve, reject) => {
        Papa.parse(file, {
          complete: resolve,
          error: reject,
          header: true,
        });
      });

      const parsedLeads = (results as any).data
        .filter((row: any) => row.name && row.email)
        .map((row: any) => ({
          name: row.name,
          email: row.email,
          status: 'Pending',
          classification: null,
        }));

      if (parsedLeads.length === 0) {
        throw new Error('No valid leads found in CSV. Please ensure your CSV has "name" and "email" columns.');
      }

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedLeads),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload leads');
      }

      // Fetch updated leads instead of reloading the page
      await fetchLeads();
    } catch (error) {
      console.error('Error processing CSV:', error);
      alert(error instanceof Error ? error.message : 'Failed to process CSV file. Please check the format and try again.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
          
          {/* Recent Leads Section */}
          <div className="mt-12">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-mono text-xl text-gray-300 tracking-widest uppercase">Recent Leads</h2>
              <button 
                onClick={handleUploadClick}
                className="border border-gray-700 bg-black text-gray-300 px-6 py-3
                         font-mono text-xs tracking-widest uppercase hover:text-white
                         hover:border-gray-600 transition-colors"
              >
                Upload Leads
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
            
            <div className="bg-black border border-gray-800">
              <LeadTable leads={leads} loading={loading} />
            </div>
          </div>
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