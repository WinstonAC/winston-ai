import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { CampaignCreator } from '@/components/CampaignCreator';
import { Loader } from '@/components/Loader';
import Navigation from '@/components/Navigation';
import Head from 'next/head';

const Campaigns = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [segments, setSegments] = useState([]);
  const [leads, setLeads] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [templatesRes, segmentsRes, leadsRes] = await Promise.all([
        fetch('/api/templates'),
        fetch('/api/segments'),
        fetch('/api/leads')
      ]);

      if (!templatesRes.ok || !segmentsRes.ok || !leadsRes.ok) {
        throw new Error('Failed to fetch campaign data');
      }

      const [templatesData, segmentsData, leadsData] = await Promise.all([
        templatesRes.json(),
        segmentsRes.json(),
        leadsRes.json()
      ]);

      setTemplates(templatesData);
      setSegments(segmentsData);
      setLeads(leadsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch campaign data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCampaign = async (campaign: any) => {
    try {
      setIsLoading(true);
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

      setSuccessMessage('Campaign created successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCampaign = async (campaign: any) => {
    try {
      setIsLoading(true);
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

      setSuccessMessage('Campaign updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete campaign');
      }

      setSuccessMessage('Campaign deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete campaign');
    } finally {
      setIsLoading(false);
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
              onClick={fetchData}
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
        <title>Campaigns - Winston AI</title>
      </Head>
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {successMessage && (
          <div className="mb-4 bg-green-900/50 border border-green-500 rounded-lg p-4">
            {successMessage}
          </div>
        )}
        
        <CampaignCreator
          leads={leads}
          templates={templates}
          segments={segments}
          onCreateCampaign={handleCreateCampaign}
          onUpdateCampaign={handleUpdateCampaign}
          onDeleteCampaign={handleDeleteCampaign}
        />
      </div>
    </div>
  );
};

export default Campaigns; 