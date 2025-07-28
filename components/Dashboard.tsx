import React, { useRef, useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  EnvelopeIcon, 
  CalendarIcon, 
  UserGroupIcon, 
  ArrowTrendingUpIcon,
  BeakerIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
// import SandboxSettings from './SandboxSettings'; // DEMO MODE: Removed sandbox functionality
import { useRouter } from 'next/router';
import Papa from 'papaparse';
import LeadTable from './LeadTable';

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
  // onSandboxSettingsUpdate?: (settings: any) => void; // DEMO MODE: Removed sandbox functionality
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
  company: string;
  title: string;
  status: 'new' | 'contacted' | 'qualified' | 'unqualified';
  lastContacted?: string;
  notes?: string;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'failed';
  metrics?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    replied: number;
    meetings: number;
  };
  createdAt: string;
  updatedAt: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon }) => (
  <div className="bg-gray-900/50 backdrop-blur rounded-lg p-6 border border-gray-800/50">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <p className="text-gray-400 text-sm font-mono tracking-wider">{title}</p>
        <p className="text-2xl font-light text-white">{value || '0'}</p>
        {change && (
          <p className="text-green-400 text-sm flex items-center font-mono">
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            {change}
          </p>
        )}
      </div>
      <div className="bg-gray-800/50 p-3 rounded-lg">
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
          id: crypto.randomUUID(),
          name: row.name,
          email: row.email,
          company: row.company || '',
          title: row.title || '',
          status: 'new' as const,
          lastContacted: undefined,
          notes: row.notes || ''
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
    <div className="p-6">
      <h3 className="font-mono text-gray-400 mb-6 tracking-wider uppercase text-sm">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="border border-gray-800/50 p-4 font-mono text-xs tracking-wider
                     text-gray-400 uppercase bg-gray-900/30 rounded-lg
                     hover:bg-gray-800/50 hover:text-white hover:border-gray-700 
                     transition-all duration-200 ease-in-out"
          >
            {action.text}
          </button>
        ))}
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

const CampaignsSection: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/campaigns');
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-400';
      case 'scheduled':
        return 'text-blue-400';
      case 'completed':
        return 'text-gray-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur rounded-lg border border-gray-800/50 p-6">
        <div className="flex items-center justify-center h-32">
          <ArrowPathIcon className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur rounded-lg border border-gray-800/50 overflow-hidden">
      <div className="p-6 border-b border-gray-800/50">
        <div className="flex justify-between items-center">
          <h2 className="font-mono text-xl text-gray-300 tracking-wider uppercase">Active Campaigns</h2>
          <button 
            onClick={() => window.location.href = '/campaigns/new'}
            className="border border-gray-800/50 bg-gray-900/30 text-gray-300 px-6 py-3
                     font-mono text-xs tracking-wider uppercase rounded-lg
                     hover:bg-gray-800/50 hover:text-white hover:border-gray-700
                     transition-all duration-200 ease-in-out"
          >
            New Campaign
          </button>
        </div>
      </div>
      
      <div className="divide-y divide-gray-800/50">
        {campaigns.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            <RocketLaunchIcon className="w-12 h-12 mx-auto mb-4" />
            <p className="font-mono">No active campaigns</p>
            <p className="text-sm mt-2">Create your first campaign to get started</p>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <div key={campaign.id} className="p-6 hover:bg-gray-800/30 transition-colors duration-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white font-medium">{campaign.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{campaign.description}</p>
                </div>
                <span className={`font-mono text-sm ${getStatusColor(campaign.status)}`}>
                  {campaign.status.toUpperCase()}
                </span>
              </div>
              
              {campaign.metrics && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-gray-400 text-xs font-mono">SENT</p>
                    <p className="text-white mt-1">{campaign.metrics.sent}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs font-mono">OPENED</p>
                    <p className="text-white mt-1">{campaign.metrics.opened}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs font-mono">CLICKED</p>
                    <p className="text-white mt-1">{campaign.metrics.clicked}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs font-mono">REPLIES</p>
                    <p className="text-white mt-1">{campaign.metrics.replied}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ 
  stats, 
  recentActivity, 
  isSandbox = false,
  onSandboxReset,
  // onSandboxSettingsUpdate // DEMO MODE: Removed sandbox functionality
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get today's date in a clean format
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric', 
    month: 'long',
    day: 'numeric'
  });

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

  // Calculate real lead counts by status
  const getLeadCounts = () => {
    const counts = {
      total: leads.length,
      new: leads.filter(lead => lead.status === 'new').length,
      contacted: leads.filter(lead => lead.status === 'contacted').length,
      qualified: leads.filter(lead => lead.status === 'qualified').length,
      converted: leads.filter(lead => lead.status === 'converted').length,
      unqualified: leads.filter(lead => lead.status === 'unqualified').length
    };
    return counts;
  };

  const leadCounts = getLeadCounts();

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
          id: crypto.randomUUID(),
          name: row.name,
          email: row.email,
          company: row.company || '',
          title: row.title || '',
          status: 'new' as const,
          lastContacted: undefined,
          notes: row.notes || ''
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Date Display */}
      <div className="text-center mb-6">
        <p className="text-lg text-gray-400 font-mono">Today is {today}</p>
      </div>

      {/* Sandbox Indicator */}
      {isSandbox && (
        <div className="flex items-center justify-center bg-blue-900/20 border border-blue-800/50 rounded-lg p-4 mb-8">
          <BeakerIcon className="h-5 w-5 text-blue-400 mr-2" />
          <span className="text-blue-400 font-mono">Sandbox Mode Active</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Leads"
          value={leadCounts.total}
          change="Live from Supabase"
          icon={UserGroupIcon}
        />
        <StatCard
          title="Open Rate"
          value={`${stats.openRate || 0}%`}
          change="+5% from last week"
          icon={EnvelopeIcon}
        />
        <StatCard
          title="Response Rate"
          value={`${stats.responseRate || 0}%`}
          change="+8% from last week"
          icon={ChartBarIcon}
        />
        <StatCard
          title="Meetings Booked"
          value={stats.meetings || 0}
          change="+3 from last week"
          icon={CalendarIcon}
        />
      </div>

      {/* Lead Status Breakdown */}
      <div className="bg-gray-900/50 backdrop-blur rounded-lg border border-gray-800/50 p-6">
        <h3 className="text-lg font-mono text-[#32CD32] mb-4 tracking-wider uppercase">Lead Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{leadCounts.new}</div>
            <div className="text-sm text-gray-400 font-mono">New</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{leadCounts.contacted}</div>
            <div className="text-sm text-gray-400 font-mono">Contacted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{leadCounts.qualified}</div>
            <div className="text-sm text-gray-400 font-mono">Qualified</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{leadCounts.converted}</div>
            <div className="text-sm text-gray-400 font-mono">Converted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{leadCounts.unqualified}</div>
            <div className="text-sm text-gray-400 font-mono">Unqualified</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#32CD32]">{leadCounts.total}</div>
            <div className="text-sm text-gray-400 font-mono">Total</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-gray-900/50 backdrop-blur rounded-lg border border-gray-800/50 overflow-hidden">
            <ActivityFeed activities={recentActivity} />
          </div>
          
          {/* Campaigns Section */}
          <CampaignsSection />
          
          {/* Recent Leads Section */}
          <div className="bg-gray-900/50 backdrop-blur rounded-lg border border-gray-800/50 overflow-hidden">
            <div className="p-6 border-b border-gray-800/50">
              <div className="flex justify-between items-center">
                <h2 className="font-mono text-xl text-gray-300 tracking-wider uppercase">Recent Leads</h2>
                <button 
                  onClick={handleUploadClick}
                  className="border border-gray-800/50 bg-gray-900/30 text-gray-300 px-6 py-3
                           font-mono text-xs tracking-wider uppercase rounded-lg
                           hover:bg-gray-800/50 hover:text-white hover:border-gray-700
                           transition-all duration-200 ease-in-out"
                >
                  Upload Leads
                </button>
              </div>
            </div>
            
            <div className="bg-black/50">
              <LeadTable leads={leads} loading={loading} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-gray-900/50 backdrop-blur rounded-lg border border-gray-800/50 overflow-hidden">
            <QuickActions isSandbox={isSandbox} />
          </div>
          {/* DEMO MODE: Removed sandbox settings functionality
          {isSandbox && onSandboxSettingsUpdate && (
            <div className="bg-gray-900/50 backdrop-blur rounded-lg border border-gray-800/50 overflow-hidden">
              <SandboxSettings onUpdate={onSandboxSettingsUpdate} />
            </div>
          )}
          */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 