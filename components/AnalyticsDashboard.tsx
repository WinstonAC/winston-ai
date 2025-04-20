import React, { useState } from 'react';
import { 
  ChartBarIcon, 
  EnvelopeIcon, 
  UserGroupIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

interface CampaignStats {
  id: string;
  name: string;
  totalLeads: number;
  emailsSent: number;
  opens: number;
  replies: number;
  meetings: number;
  conversionRate: number;
  avgResponseTime: number;
  status: 'active' | 'completed' | 'paused';
}

interface LeadEngagement {
  id: string;
  name: string;
  company: string;
  emailsReceived: number;
  opens: number;
  replies: number;
  lastEngagement: string;
  status: 'new' | 'engaged' | 'qualified' | 'converted' | 'lost';
}

interface TimeRange {
  start: Date;
  end: Date;
}

interface AnalyticsDashboardProps {
  campaignStats: CampaignStats[];
  leadEngagement: LeadEngagement[];
  onTimeRangeChange: (range: TimeRange) => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  campaignStats,
  leadEngagement,
  onTimeRangeChange
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    end: new Date()
  });

  const handleTimeRangeChange = (start: Date, end: Date) => {
    const newRange = { start, end };
    setTimeRange(newRange);
    onTimeRangeChange(newRange);
  };

  const calculateTotalStats = () => {
    return campaignStats.reduce((acc, campaign) => ({
      emailsSent: acc.emailsSent + campaign.emailsSent,
      opens: acc.opens + campaign.opens,
      replies: acc.replies + campaign.replies,
      meetings: acc.meetings + campaign.meetings,
      conversionRate: (acc.conversionRate + campaign.conversionRate) / campaignStats.length
    }), {
      emailsSent: 0,
      opens: 0,
      replies: 0,
      meetings: 0,
      conversionRate: 0
    });
  };

  const totalStats = calculateTotalStats();

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendValue 
  }: { 
    title: string; 
    value: number | string; 
    icon: React.ElementType;
    trend?: 'up' | 'down';
    trendValue?: string;
  }) => (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-medium text-white">{value}</p>
        </div>
        <div className="p-2 bg-gray-700 rounded-lg">
          <Icon className="h-6 w-6 text-gray-400" />
        </div>
      </div>
      {trend && trendValue && (
        <div className={`mt-2 flex items-center text-sm ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {trend === 'up' ? <ArrowTrendingUpIcon className="h-4 w-4 mr-1" /> : <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />}
          {trendValue}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <ChartBarIcon className="h-6 w-6 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-white">Analytics Dashboard</h3>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleTimeRangeChange(
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              new Date()
            )}
            className="text-gray-400 hover:text-white"
          >
            Last 7 days
          </button>
          <button
            onClick={() => handleTimeRangeChange(
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              new Date()
            )}
            className="text-gray-400 hover:text-white"
          >
            Last 30 days
          </button>
          <button
            onClick={() => handleTimeRangeChange(
              new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
              new Date()
            )}
            className="text-gray-400 hover:text-white"
          >
            Last 90 days
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Emails Sent"
          value={totalStats.emailsSent}
          icon={EnvelopeIcon}
          trend="up"
          trendValue="+12% from last period"
        />
        <StatCard
          title="Open Rate"
          value={`${((totalStats.opens / totalStats.emailsSent) * 100).toFixed(1)}%`}
          icon={UserGroupIcon}
          trend="up"
          trendValue="+5% from last period"
        />
        <StatCard
          title="Reply Rate"
          value={`${((totalStats.replies / totalStats.emailsSent) * 100).toFixed(1)}%`}
          icon={CalendarIcon}
          trend="down"
          trendValue="-2% from last period"
        />
        <StatCard
          title="Conversion Rate"
          value={`${totalStats.conversionRate.toFixed(1)}%`}
          icon={CheckCircleIcon}
          trend="up"
          trendValue="+3% from last period"
        />
      </div>

      {/* Campaign Performance */}
      <div className="mb-6">
        <h4 className="text-lg font-medium text-white mb-4">Campaign Performance</h4>
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Emails Sent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Open Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Reply Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Meetings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {campaignStats.map((campaign) => (
                <tr key={campaign.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-white">{campaign.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${
                      campaign.status === 'active' ? 'bg-green-900 text-green-300' :
                      campaign.status === 'completed' ? 'bg-blue-900 text-blue-300' :
                      'bg-gray-900 text-gray-300'
                    }`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400">{campaign.emailsSent}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                    {((campaign.opens / campaign.emailsSent) * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                    {((campaign.replies / campaign.emailsSent) * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400">{campaign.meetings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Engagement */}
      <div>
        <h4 className="text-lg font-medium text-white mb-4">Lead Engagement</h4>
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Lead</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Emails</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Opens</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Replies</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Engagement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {leadEngagement.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-white">{lead.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400">{lead.company}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${
                      lead.status === 'new' ? 'bg-gray-900 text-gray-300' :
                      lead.status === 'engaged' ? 'bg-blue-900 text-blue-300' :
                      lead.status === 'qualified' ? 'bg-green-900 text-green-300' :
                      lead.status === 'converted' ? 'bg-purple-900 text-purple-300' :
                      'bg-red-900 text-red-300'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400">{lead.emailsReceived}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400">{lead.opens}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400">{lead.replies}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                    {new Date(lead.lastEngagement).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 