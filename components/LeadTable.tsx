import React, { useEffect, useState } from 'react';
// import { supabase } from '@/lib/supabase';
import Papa from 'papaparse';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  BuildingOfficeIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  title: string;
  status: 'new' | 'contacted' | 'qualified' | 'unqualified';
  lastContacted?: string;
  notes?: string;
}

interface LeadTableProps {
  leads: Lead[];
  loading: boolean;
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
  <div className="p-8 text-center text-gray-400">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
    <p className="mt-4">Loading leads...</p>
  </div>
);

const ErrorState: React.FC<{ error: string }> = ({ error }) => (
  <div className="p-8 text-center text-red-400">
    <div className="space-y-4">
      <div className="text-xl">Error loading leads</div>
      <div className="text-sm">{error}</div>
    </div>
  </div>
);

// Mock data for UI development
const mockLeads = [
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
  // Add more mock leads as needed
];

const LeadTable: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      if (!response.ok) throw new Error('Failed to fetch leads');
      const data = await response.json();
      setLeads(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: Lead['status']) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update lead status');

      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lead status');
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteLead = async (leadId: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete lead');

      setLeads(prev => prev.filter(lead => lead.id !== leadId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lead');
    }
  };

  if (loading) return <div className="animate-pulse">Loading leads...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">{lead.name.charAt(0)}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                    <div className="text-sm text-gray-500">{lead.title}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{lead.email}</div>
                <div className="text-sm text-gray-500">{lead.company}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{lead.company}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                  lead.status === 'unqualified' ? 'bg-red-100 text-red-800' :
                  lead.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {lead.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => updateLeadStatus(lead.id, 'qualified')}
                  disabled={isUpdating}
                  className="text-green-600 hover:text-green-900 mr-4"
                >
                  <CheckIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => updateLeadStatus(lead.id, 'unqualified')}
                  disabled={isUpdating}
                  className="text-red-600 hover:text-red-900 mr-4"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => deleteLead(lead.id)}
                  disabled={isUpdating}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadTable;
export type { Lead }; 