import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import CampaignCreator from '@/components/CampaignCreator';
import { useRouter } from 'next/router';

// Mock data for development
const mockTemplates = [
  { id: '1', name: 'Welcome Email' },
  { id: '2', name: 'Follow-up Email' },
  { id: '3', name: 'Newsletter' },
];

const mockSegments = [
  { id: '1', name: 'All Leads' },
  { id: '2', name: 'New Leads' },
  { id: '3', name: 'Engaged Leads' },
];

const mockLeads = [
  { id: '1', name: 'John Doe', email: 'john@example.com', company: 'Acme Inc', title: 'CEO' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', company: 'Tech Corp', title: 'CTO' },
];

const Campaigns = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCreateCampaign = async (campaign: any) => {
    try {
      setError(null);
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaign),
      });

      if (!response.ok) {
        throw new Error('Failed to create campaign');
      }

      const data = await response.json();
      setSuccessMessage('Campaign created successfully!');
      router.push(`/campaigns/${data.id}`);
      return data;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create campaign');
      throw error;
    }
  };

  const handleUpdateCampaign = async (campaign: any) => {
    try {
      setError(null);
      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaign),
      });

      if (!response.ok) {
        throw new Error('Failed to update campaign');
      }

      const data = await response.json();
      setSuccessMessage('Campaign updated successfully!');
      return data;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update campaign');
      throw error;
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete campaign');
      }

      setSuccessMessage('Campaign deleted successfully!');
      router.reload();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete campaign');
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-mono font-bold mb-4">CAMPAIGN_MANAGER_</h1>
          <p className="text-[#32CD32] font-mono">CREATE_AND_MANAGE_YOUR_EMAIL_CAMPAIGNS_</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900 text-white rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-900 text-white rounded-lg">
            {successMessage}
          </div>
        )}

        <CampaignCreator
          leads={mockLeads}
          templates={mockTemplates}
          segments={mockSegments}
          onCreateCampaign={handleCreateCampaign}
          onUpdateCampaign={handleUpdateCampaign}
          onDeleteCampaign={handleDeleteCampaign}
        />
      </div>
    </div>
  );
};

export default Campaigns; 