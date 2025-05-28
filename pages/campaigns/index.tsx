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
  status: 'active' | 'draft' | 'paused';
  start_date: string;
  end_date: string;
  budget: number;
  user_id: string;
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

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch campaigns
        const { data: campaignsData, error: campaignsError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (campaignsError) throw campaignsError;
        setCampaigns(campaignsData || []);

        // Fetch analytics for all campaigns
        const { data: analyticsData, error: analyticsError } = await supabase
          .from('campaign_analytics')
          .select('*')
          .in('campaign_id', campaignsData?.map(c => c.id) || [])
          .order('date', { ascending: true });

        if (analyticsError) throw analyticsError;
        setAnalytics(analyticsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading, router]);

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
                    {new Date(campaign.start_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(campaign.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${campaign.budget.toLocaleString()}
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