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
  classification?: 'Interested' | 'Not Interested' | 'Needs Info';
}

interface LeadTableProps {
  leads: Lead[];
  loading?: boolean;
}

const StatusBadge: React.FC<{ status: Lead['status'] }> = ({ status }) => {
  const getStatusStyle = (status: Lead['status']) => {
    switch (status) {
      case 'qualified':
        return 'bg-green-400/20 text-green-400 border-green-400/50';
      case 'contacted':
        return 'bg-blue-400/20 text-blue-400 border-blue-400/50';
      case 'unqualified':
        return 'bg-red-400/20 text-red-400 border-red-400/50';
      case 'new':
      default:
        return 'bg-gray-400/20 text-gray-400 border-gray-400/50';
    }
  };

  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5
      text-xs font-mono
      border rounded-full
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

const LeadTable: React.FC<LeadTableProps> = ({ leads, loading }) => {
  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-800/50">
        <thead className="bg-gray-900/50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-4 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-4 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">
              Company
            </th>
            <th className="px-6 py-4 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">
              Last Contacted
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-gray-800/50 transition-colors duration-150">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-200 font-mono">{lead.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-200 font-mono">{lead.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-200 font-mono">{lead.company}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={lead.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-200 font-mono">{lead.lastContacted || 'Never'}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {leads.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 font-mono">No leads found</p>
        </div>
      )}
    </div>
  );
};

export default LeadTable;
export type { Lead }; 