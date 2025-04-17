import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Lead {
  id: string;
  name: string;
  email: string;
  status: 'Sent' | 'Opened' | 'Clicked' | 'Booked' | 'Bounced';
  classification: 'Interested' | 'Not Interested' | 'Needs Info' | null;
  sent_at: string;
}

const StatusBadge: React.FC<{ status: Lead['status'] }> = ({ status }) => {
  const getStatusStyle = (status: Lead['status']) => {
    switch (status) {
      case 'Clicked':
        return 'bg-brutalist-lime border-black';
      case 'Opened':
        return 'bg-white border-black';
      case 'Bounced':
        return 'bg-brutalist-gray border-black';
      default:
        return 'bg-white border-black';
    }
  };

  return (
    <span className={`
      inline-block px-2 py-1
      text-sm
      border-2
      font-mono
      ${getStatusStyle(status)}
    `}>
      {status}
    </span>
  );
};

const ClassificationBadge: React.FC<{ classification: Lead['classification'] }> = ({ classification }) => {
  if (!classification) return null;

  const getClassificationStyle = (classification: string) => {
    switch (classification) {
      case 'Interested':
        return 'bg-brutalist-lime border-black';
      case 'Not Interested':
        return 'bg-brutalist-gray border-black';
      case 'Needs Info':
        return 'bg-white border-black';
      default:
        return 'bg-white border-black';
    }
  };

  return (
    <span className={`
      inline-block px-2 py-1
      text-sm
      border-2
      font-mono
      ${getClassificationStyle(classification)}
    `}>
      {classification}
    </span>
  );
};

const LoadingState: React.FC = () => (
  <div className="border-thicc border-black bg-white p-8 text-center font-mono">
    <div className="space-y-4">
      <div className="text-xl">Loading leads...</div>
      <div className="text-sm text-gray-600">Please wait</div>
    </div>
  </div>
);

const ErrorState: React.FC<{ error: string }> = ({ error }) => (
  <div className="border-thicc border-black bg-white p-8 text-center font-mono">
    <div className="space-y-4">
      <div className="text-xl text-red-600">Error loading leads</div>
      <div className="text-sm">{error}</div>
    </div>
  </div>
);

// Mock data for initial render
const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    status: 'Opened',
    classification: 'Interested',
    sent_at: '2024-03-20T10:00:00Z'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    status: 'Clicked',
    classification: 'Needs Info',
    sent_at: '2024-03-20T09:30:00Z'
  },
  {
    id: '3',
    name: 'Mike Brown',
    email: 'mike@example.com',
    status: 'Sent',
    classification: null,
    sent_at: '2024-03-20T09:00:00Z'
  },
  {
    id: '4',
    name: 'Emma Wilson',
    email: 'emma@example.com',
    status: 'Booked',
    classification: 'Interested',
    sent_at: '2024-03-20T08:30:00Z'
  },
  {
    id: '5',
    name: 'Alex Davis',
    email: 'alex@example.com',
    status: 'Bounced',
    classification: 'Not Interested',
    sent_at: '2024-03-20T08:00:00Z'
  }
];

const LeadTable: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('sent_at', { ascending: false });

        if (error) throw error;
        if (data) setLeads(data);
      } catch (err) {
        console.error('Error fetching leads:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch leads');
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8 font-mono">
        Loading leads...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 font-mono text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse font-mono">
        <thead>
          <tr>
            <th className="border-b-thicc border-black p-4 text-left">Name</th>
            <th className="border-b-thicc border-black p-4 text-left">Email</th>
            <th className="border-b-thicc border-black p-4 text-left">Status</th>
            <th className="border-b-thicc border-black p-4 text-left">Classification</th>
            <th className="border-b-thicc border-black p-4 text-left">Sent At</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-brutalist-gray">
              <td className="border-b border-black p-4">{lead.name}</td>
              <td className="border-b border-black p-4">{lead.email}</td>
              <td className="border-b border-black p-4">
                <span className={`
                  inline-block px-2 py-1 
                  ${lead.status === 'Booked' ? 'bg-brutalist-lime' : 
                    lead.status === 'Bounced' ? 'bg-red-200' :
                    lead.status === 'Clicked' ? 'bg-yellow-200' :
                    lead.status === 'Opened' ? 'bg-blue-200' :
                    'bg-gray-200'}
                  border border-black
                `}>
                  {lead.status}
                </span>
              </td>
              <td className="border-b border-black p-4">
                {lead.classification || '—'}
              </td>
              <td className="border-b border-black p-4">
                {new Date(lead.sent_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LeadTable;
export type { Lead }; 