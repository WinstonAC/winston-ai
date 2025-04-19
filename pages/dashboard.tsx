import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';
import LeadTable from '@/components/LeadTable';

// Dynamically import the Dashboard component to avoid SSR issues
const DashboardComponent = dynamic(() => import('@/components/Dashboard'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="h-20 bg-gray-800 rounded-lg"></div>
          </div>
        ))}
      </div>
    </div>
  ),
});

interface DashboardData {
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
}

interface Lead {
  id: string;
  name: string;
  email: string;
  status: 'Sent' | 'Opened' | 'Clicked' | 'Booked' | 'Bounced';
  classification: 'Interested' | 'Not Interested' | 'Needs Info' | null;
  sent_at: string;
  created_at: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      const createTeamIfNeeded = async () => {
        try {
          // Try to create a personal team automatically
          const createTeamResponse = await fetch('/api/team/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type: 'personal' }),
          });

          if (!createTeamResponse.ok) {
            console.error('Failed to create team:', await createTeamResponse.text());
          }
        } catch (error) {
          console.error('Error creating team:', error);
        }
      };

      const fetchDashboardData = async () => {
        try {
          setLoading(true);
          setError(null);

          // Fetch dashboard stats
          const statsResponse = await fetchWithRetry('/api/dashboard/stats');
          
          if (!statsResponse.ok) {
            const errorData = await statsResponse.json();
            
            // If we need team setup, try to create one automatically
            if (errorData.code === 'NO_TEAM') {
              await createTeamIfNeeded();
              // Retry fetching stats after team creation
              const retryStatsResponse = await fetchWithRetry('/api/dashboard/stats');
              if (!retryStatsResponse.ok) {
                throw new Error(errorData.details || errorData.message);
              }
              const statsData = await retryStatsResponse.json();
              setDashboardData(statsData);
            } else {
              throw new Error(errorData.details || errorData.message);
            }
          } else {
            const statsData = await statsResponse.json();
            setDashboardData(statsData);
          }

          // Only fetch leads if we have successfully fetched stats
          const leadsResponse = await fetchWithRetry('/api/leads');
          const leadsData = await leadsResponse.json();
          
          if (!leadsResponse.ok) {
            throw new Error('Failed to fetch leads');
          }
          
          setLeads(leadsData);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          setError(error instanceof Error ? error.message : 'An error occurred while fetching data');
        } finally {
          setLoading(false);
        }
      };

      fetchDashboardData();
    }
  }, [status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-white">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="max-w-md mx-auto mt-32 p-6 bg-gray-900 rounded-lg border border-gray-800">
          <h2 className="text-xl font-mono text-white mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-200 mb-6">{error}</p>
          <div className="space-y-4">
            <button
              onClick={async () => {
                try {
                  // Sign out and clear everything first
                  localStorage.clear();
                  sessionStorage.clear();
                  
                  // Try to create a team
                  const createTeamResponse = await fetch('/api/team/create', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                  });

                  const result = await createTeamResponse.json();

                  if (!createTeamResponse.ok) {
                    throw new Error(result.details || result.message || 'Failed to create team');
                  }

                  // Force reload the page
                  window.location.href = '/dashboard';
                } catch (error) {
                  console.error('Error:', error);
                  alert(error.message || 'Failed to create team. Please try signing out and back in.');
                }
              }}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Reset & Create Team
            </button>
            <a
              href="/api/auth/signout"
              className="block w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-center"
            >
              Sign Out & Try Again
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Head>
        <title>Dashboard - Winston AI</title>
        <meta name="description" content="Manage your leads and outreach campaigns" />
      </Head>

      <Navigation />

      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Dashboard Stats and Activity */}
          {dashboardData && (
            <DashboardComponent 
              stats={dashboardData.stats}
              recentActivity={dashboardData.recentActivity}
            />
          )}
          
          {/* Leads Table Section */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-light text-white">Recent Leads</h2>
              <button 
                onClick={() => router.push('/upload')}
                className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors"
              >
                Upload Leads
              </button>
            </div>
            
            <div className="bg-gray-900 rounded-lg shadow border border-gray-800">
              <LeadTable leads={leads} loading={loading} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 