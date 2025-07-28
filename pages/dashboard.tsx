import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';
import LeadTable, { Lead } from '@/components/LeadTable';
import Loader from '@/components/Loader';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Chatbot from '@/components/Chatbot';
import type { Session } from '@supabase/supabase-js';

// Dynamically import the Dashboard component to avoid SSR issues
const DashboardComponent = dynamic(() => import('@/components/Dashboard'), {
  ssr: false,
  loading: () => <Loader />,
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
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Demo mode - skip session checks
    setIsLoading(false);
    setSession({ user: { id: "demo-user-123" } } as any);
  }, [router]);

  useEffect(() => {
    // Demo mode - always allow access, skip auth checks
    if (isClient && router.isReady && !authLoading) {
      fetchDashboardData();
    }
  }, [isClient, user, authLoading, router]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [statsRes, activityRes, leadsRes, campaignsRes, activitiesRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/activity'),
        fetch('/api/leads'),
        fetch('/api/campaigns'),
        supabase.from('analytics_events').select('*').eq('user_id', 'demo-user-123').order('created_at', { ascending: false }).limit(10)
      ]);

      // Handle API responses
      if (!statsRes.ok || !activityRes.ok || !leadsRes.ok || !campaignsRes.ok) {
        const errorData = await Promise.all([
          statsRes.ok ? null : statsRes.json(),
          activityRes.ok ? null : activityRes.json(),
          leadsRes.ok ? null : leadsRes.json(),
          campaignsRes.ok ? null : campaignsRes.json()
        ]);
        
        const errors = errorData.filter(Boolean).map(err => err?.message || 'Unknown error');
        throw new Error(`Failed to fetch dashboard data: ${errors.join(', ')}`);
      }

      const [stats, activity, leadsData, campaignsData] = await Promise.all([
        statsRes.json(),
        activityRes.json(),
        leadsRes.json(),
        campaignsRes.json()
      ]);

      // Handle Supabase responses
      const analyticsData = activitiesRes.data || [];

      setDashboardData({ stats, recentActivity: activity });
      setLeads(leadsData);
      setCampaigns(campaignsData.campaigns || []);
      setActivities(analyticsData);

    } catch (err) {
      console.error('Dashboard data error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      
      // Fallback to demo data if API fails
      setLeads([
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          company: 'Acme Corp',
          title: 'CEO',
          status: 'new',
          lastContacted: '2024-01-15'
        },
        {
          id: '2', 
          name: 'Jane Smith',
          email: 'jane@example.com',
          company: 'Tech Inc',
          title: 'CTO',
          status: 'contacted',
          lastContacted: '2024-01-14'
        }
      ]);
      
      setCampaigns([
        {
          id: '1',
          name: 'Q3 2025 Outreach Campaign',
          status: 'active',
          leads: 150,
          responses: 23
        }
      ]);
      
      setActivities([
        {
          id: '1',
          type: 'email_sent',
          description: 'Welcome email sent to John Doe',
          timestamp: '2024-01-15T10:30:00Z'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      // Demo mode: just redirect to home
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (authLoading) {
    return <Loader />;
  }

  if (!isClient || !router.isReady) {
    return <Loader />;
  }

  // Demo mode - always allow access

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h2 className="text-xl font-mono text-[#32CD32] mb-4">Loading...</h2>
          <p className="text-gray-400">Please wait while we load your dashboard.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <>
      <Head>
        <title>Dashboard - Winston AI</title>
      </Head>
      
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-[#32CD32] text-4xl font-mono">Dashboard</h1>
          </div>
          <div className="bg-white/5 border-2 border-[#32CD32] rounded-lg p-6">
            <h2 className="text-[#32CD32] text-2xl font-mono mb-4">Welcome to your dashboard</h2>
            <p className="text-white font-mono">You are now signed in and can access protected content.</p>
          </div>
        </div>

        {dashboardData && (
          <DashboardComponent 
            stats={dashboardData.stats}
            recentActivity={dashboardData.recentActivity}
          />
        )}
        
        <div className="container mx-auto px-4 py-8">
          <LeadTable leads={leads} />
        </div>
      </div>
    </>
  );
} 