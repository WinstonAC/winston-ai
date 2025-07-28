import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type Campaign = {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'draft' | 'paused' | 'completed';
  start_date?: string;
  end_date?: string;
  budget?: number;
  user_id: string;
  createdAt?: string;
  updatedAt?: string;
  metrics?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    replied: number;
    meetings: number;
  };
};

type Analytics = {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  campaign_id: string;
};

function CampaignsContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !router.isReady || authLoading) return;
    
    // Demo mode - skip auth check
    const fetchData = async () => {
      try {
        // Fetch campaigns from API
        const campaignsResponse = await fetch('/api/campaigns');
        if (!campaignsResponse.ok) throw new Error('Failed to fetch campaigns');
        const campaignsData = await campaignsResponse.json();
        setCampaigns(campaignsData.campaigns || []);

        // For demo purposes, create mock analytics data
        const mockAnalytics = [
          { date: '2025-07-24', impressions: 1200, clicks: 45, conversions: 8, spend: 150, campaign_id: '1' },
          { date: '2025-07-25', impressions: 1350, clicks: 52, conversions: 12, spend: 180, campaign_id: '1' },
          { date: '2025-07-26', impressions: 1100, clicks: 38, conversions: 6, spend: 120, campaign_id: '1' },
          { date: '2025-07-27', impressions: 1600, clicks: 67, conversions: 15, spend: 220, campaign_id: '1' },
          { date: '2025-07-28', impressions: 1400, clicks: 58, conversions: 11, spend: 190, campaign_id: '1' },
        ];
        setAnalytics(mockAnalytics);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to demo data
        setCampaigns([
          {
            id: '1',
            name: 'Q3 2025 Outreach Campaign',
            description: 'Tech company outreach for Q3 2025',
            status: 'active',
            user_id: user.id,
            metrics: { sent: 150, delivered: 145, opened: 98, clicked: 24, bounced: 5, replied: 18, meetings: 6 },
            createdAt: '2025-07-01T10:00:00Z',
            updatedAt: '2025-07-28T14:30:00Z'
          }
        ]);
        setAnalytics([
          { date: '2025-07-27', impressions: 1200, clicks: 45, conversions: 8, spend: 150, campaign_id: '1' },
          { date: '2025-07-28', impressions: 1350, clicks: 52, conversions: 12, spend: 180, campaign_id: '1' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isClient, user, authLoading, router]);

  const chartData = {
    labels: analytics.map(a => new Date(a.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Impressions',
        data: analytics.map(a => a.impressions),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Clicks',
        data: analytics.map(a => a.clicks),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
      {
        label: 'Conversions',
        data: analytics.map(a => a.conversions),
        borderColor: 'rgb(53, 162, 235)',
        tension: 0.1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Campaigns Dashboard</h1>
        <button
          onClick={() => router.push('/campaigns/new')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Campaign
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500">Total Campaigns</h3>
          <p className="text-2xl font-bold">{campaigns.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500">Total Impressions</h3>
          <p className="text-2xl font-bold">
            {analytics.reduce((sum, a) => sum + a.impressions, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500">Total Clicks</h3>
          <p className="text-2xl font-bold">
            {analytics.reduce((sum, a) => sum + a.clicks, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500">Total Conversions</h3>
          <p className="text-2xl font-bold">
            {analytics.reduce((sum, a) => sum + a.conversions, 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Performance Overview</h2>
        <div className="h-80">
          <Line 
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
              },
            }}
          />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Campaigns</h2>
          <button
            onClick={() => router.push('/campaigns/new')}
            className="bg-[#32CD32] text-black px-4 py-2 rounded-md font-mono tracking-wider hover:bg-[#32CD32]/90 transition-colors"
          >
            CREATE CAMPAIGN
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.map(campaign => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'Not set'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'Not set'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {campaign.budget ? `$${campaign.budget.toLocaleString()}` : 'Not set'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => router.push(`/campaigns/${campaign.id}`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function CampaignsPage() {
  return <CampaignsContent />;
} 