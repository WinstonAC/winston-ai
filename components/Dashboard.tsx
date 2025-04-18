import React from 'react';
import { 
  ChartBarIcon, 
  EnvelopeIcon, 
  UserGroupIcon, 
  ArrowTrendingUpIcon 
} from '@heroicons/react/24/outline';

interface DashboardProps {
  stats: {
    totalLeads: number;
    openRate: number;
    responseRate: number;
    meetings: number;
  };
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

const ActivityFeed: React.FC = () => (
  <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
    <h3 className="text-lg font-light text-white mb-4">Recent Activity</h3>
    <div className="space-y-4">
      {[
        { time: '2h ago', text: 'John Doe opened your email' },
        { time: '4h ago', text: 'Meeting scheduled with Sarah Smith' },
        { time: '6h ago', text: 'New campaign started: Tech Leaders Q2' },
        { time: '1d ago', text: 'Michael Johnson clicked your link' },
      ].map((activity, index) => (
        <div key={index} className="flex items-start space-x-3 text-sm">
          <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
          <div>
            <p className="text-gray-300">{activity.text}</p>
            <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const QuickActions: React.FC = () => (
  <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
    <h3 className="text-lg font-light text-white mb-4">Quick Actions</h3>
    <div className="grid grid-cols-2 gap-4">
      {[
        { text: 'New Campaign', color: 'bg-blue-500' },
        { text: 'Import Leads', color: 'bg-purple-500' },
        { text: 'Schedule Meeting', color: 'bg-green-500' },
        { text: 'View Reports', color: 'bg-yellow-500' },
      ].map((action, index) => (
        <button
          key={index}
          className={`${action.color} bg-opacity-10 hover:bg-opacity-20 text-white p-4 rounded-lg text-sm font-medium transition-colors`}
        >
          {action.text}
        </button>
      ))}
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
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
          icon={UserGroupIcon}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
        {/* Sidebar */}
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 