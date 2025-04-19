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

// Mock data interface
interface Lead {
  id: string;
  name: string;
  email: string;
  status: 'Sent' | 'Opened' | 'Clicked' | 'Booked' | 'Bounced';
  classification: 'Interested' | 'Not Interested' | 'Needs Info' | null;
  sent_at: string;
  created_at: string;
}

// Mock data
const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    status: 'Sent',
    classification: 'Interested',
    sent_at: '2024-04-18T10:00:00Z',
    created_at: '2024-04-18T09:00:00Z'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    status: 'Opened',
    classification: 'Needs Info',
    sent_at: '2024-04-18T11:00:00Z',
    created_at: '2024-04-18T10:00:00Z'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    status: 'Clicked',
    classification: 'Interested',
    sent_at: '2024-04-18T12:00:00Z',
    created_at: '2024-04-18T11:00:00Z'
  }
];

// Mock stats data
const mockStats = {
  totalLeads: 156,
  openRate: 68,
  responseRate: 42,
  meetings: 24
};

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      const fetchLeads = async () => {
        try {
          const response = await fetch('/api/leads');
          if (!response.ok) throw new Error('Failed to fetch leads');
          const data = await response.json();
          setLeads(data);
        } catch (error) {
          console.error('Error fetching leads:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchLeads();
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
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
          <DashboardComponent stats={mockStats} />
          
          {/* Leads Table Section */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-light text-white">Recent Leads</h2>
              <button className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors">
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