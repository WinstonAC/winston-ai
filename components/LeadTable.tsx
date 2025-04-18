import React, { useEffect, useState } from 'react';
// import { supabase } from '@/lib/supabase';
import Papa from 'papaparse';

interface Lead {
  id: string;
  name: string;
  email: string;
  status: 'Sent' | 'Opened' | 'Clicked' | 'Booked' | 'Bounced';
  classification: 'Interested' | 'Not Interested' | 'Needs Info' | null;
  sent_at: string;
  created_at: string;
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

const LeadTable: React.FC<LeadTableProps> = ({ leads, loading }) => {
  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'Booked':
        return 'bg-green-900 text-green-200';
      case 'Clicked':
        return 'bg-blue-900 text-blue-200';
      case 'Opened':
        return 'bg-yellow-900 text-yellow-200';
      case 'Bounced':
        return 'bg-red-900 text-red-200';
      default:
        return 'bg-gray-800 text-gray-200';
    }
  };

  const getClassificationColor = (classification: Lead['classification']) => {
    switch (classification) {
      case 'Interested':
        return 'bg-green-900 text-green-200';
      case 'Not Interested':
        return 'bg-red-900 text-red-200';
      case 'Needs Info':
        return 'bg-yellow-900 text-yellow-200';
      default:
        return 'bg-gray-800 text-gray-200';
    }
  };

  const handleDownloadCsv = () => {
    const csv = Papa.unparse(leads.map(lead => ({
      Name: lead.name,
      Email: lead.email,
      Status: lead.status,
      Classification: lead.classification || 'Not Classified',
      'Sent At': new Date(lead.sent_at).toLocaleDateString()
    })));

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'winston-leads.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (leads.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        <p>No leads found. Upload some leads to get started!</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="mb-4 flex justify-end p-4">
        <button
          onClick={handleDownloadCsv}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Download CSV
        </button>
      </div>
      <table className="w-full border-collapse text-gray-300">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-800">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-800">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-800">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-800">
              Classification
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-800">
              Sent At
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-gray-800 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {lead.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {lead.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                  {lead.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {lead.classification && (
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getClassificationColor(lead.classification)}`}>
                    {lead.classification}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
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