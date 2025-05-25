import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';
import LeadTable from '@/components/LeadTable';
import Loader from '@/components/Loader';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Chatbot from '@/components/Chatbot';

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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      console.log("[Auth] Session data:", data);
      if (error) console.error("[Auth] Session error:", error);
      if (!data.session) {
        router.push('/auth/signin');
      }
    };
    checkSession();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [statsRes, activityRes, leadsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/activity'),
        fetch('/api/leads')
      ]);

      if (!statsRes.ok || !activityRes.ok || !leadsRes.ok) {
        const errorData = await Promise.all([
          statsRes.ok ? null : statsRes.json(),
          activityRes.ok ? null : activityRes.json(),
          leadsRes.ok ? null : leadsRes.json()
        ]);
        
        const errors = errorData.filter(Boolean).map(err => err?.message || 'Unknown error');
        throw new Error(`Failed to fetch dashboard data: ${errors.join(', ')}`);
      }

      const [stats, activity, leadsData] = await Promise.all([
        statsRes.json(),
        activityRes.json(),
        leadsRes.json()
      ]);

      setDashboardData({ stats, recentActivity: activity });
      setLeads(leadsData);
    } catch (err) {
      console.error('Dashboard data error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      // Retry after 5 seconds if there's an error
      setTimeout(fetchDashboardData, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/auth/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (status === 'loading' || isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
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

  return (
    <div className="min-h-screen bg-black text-white">
      <Head>
        <title>Dashboard - Winston AI</title>
      </Head>
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-[#32CD32] text-4xl font-mono">Dashboard</h1>
          <button
            onClick={handleSignOut}
            className="bg-[#32CD32] text-black font-mono px-6 py-2 rounded-md
                     hover:bg-[#32CD32]/90 transition-colors"
          >
            Sign out
          </button>
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
      <Chatbot />
    </div>
  );
} 