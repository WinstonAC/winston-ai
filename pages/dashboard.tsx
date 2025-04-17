import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { supabase } from '@/lib/supabase';
import LeadTable from '@/components/LeadTable';

// Mock data interface
interface MockLead {
  id: string;
  name: string;
  email: string;
  status: 'Sent' | 'Opened' | 'Clicked' | 'Booked';
  lastActivity: string;
}

// Mock data
const mockLeads: MockLead[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@techcorp.com',
    status: 'Booked',
    classification: 'Interested',
    sentAt: '2024-03-10 09:15 AM'
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    email: 'sarah@startup.io',
    status: 'Clicked',
    classification: 'Needs Info',
    sentAt: '2024-03-10 09:16 AM'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@agency.co',
    status: 'Opened',
    lastActivity: '2024-03-08'
  },
  {
    id: '4',
    name: 'Lisa Brown',
    email: 'lisa@agency.com',
    status: 'Sent',
    lastActivity: '2024-03-07'
  }
];

// Status badge component
const StatusBadge: React.FC<{ status: MockLead['status'] }> = ({ status }) => {
  const getStatusColor = (status: MockLead['status']) => {
    switch (status) {
      case 'Booked':
        return 'bg-green-100 border-green-800 text-green-800';
      case 'Clicked':
        return 'bg-blue-100 border-blue-800 text-blue-800';
      case 'Opened':
        return 'bg-yellow-100 border-yellow-800 text-yellow-800';
      default:
        return 'bg-gray-100 border-gray-800 text-gray-800';
    }
  };

  return (
    <span className={`
      inline-block px-2 py-1
      border-2
      font-mono text-sm
      ${getStatusColor(status)}
    `}>
      {status}
    </span>
  );
};

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setLeads(data || []);
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, []);

  return (
    <>
      <Head>
        <title>Dashboard | Winston AI</title>
        <meta name="description" content="Track and manage your outreach campaigns" />
      </Head>

      <h1 className="text-4xl font-bold mb-8">
        📊 Delivery Dashboard
      </h1>
      <LeadTable />
    </>
  );
} 