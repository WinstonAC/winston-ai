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

const LeadTable: React.FC<LeadTableProps> = ({ leads }) => {
  return (
    <div className="bg-gray-900 rounded-lg shadow border border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Last Contacted
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-800">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {lead.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {lead.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {lead.company}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {lead.lastContacted || 'Never'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadTable;
export type { Lead }; 