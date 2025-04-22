import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import CampaignCreator from '@/components/CampaignCreator';
import Loader from '@/components/Loader';
import Navigation from '@/components/Navigation';
import Head from 'next/head';
import { Campaign, EmailTemplate, Segment, Lead, CreateCampaignInput, UpdateCampaignInput } from '@/types/campaign';

interface CampaignState {
  isLoading: boolean;
  templates: EmailTemplate[];
  segments: Segment[];
  leads: Lead[];
  campaigns: Campaign[];
  error: string | null;
  successMessage: string | null;
}

export const Campaigns: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [state, setState] = useState<CampaignState>({
    isLoading: true,
    templates: [],
    segments: [],
    leads: [],
    campaigns: [],
    error: null,
    successMessage: null,
  });

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
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const [templatesRes, segmentsRes, leadsRes, campaignsRes] = await Promise.all([
        fetch('/api/templates'),
        fetch('/api/segments'),
        fetch('/api/leads'),
        fetch('/api/campaigns')
      ]);

      if (!templatesRes.ok || !segmentsRes.ok || !leadsRes.ok || !campaignsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [templates, segments, leads, campaigns] = await Promise.all([
        templatesRes.json(),
        segmentsRes.json(),
        leadsRes.json(),
        campaignsRes.json()
      ]);

      setState(prev => ({
        ...prev,
        templates,
        segments,
        leads,
        campaigns,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch data',
        isLoading: false
      }));
    }
  };

  const handleCreateCampaign = async (campaignData: CreateCampaignInput) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) {
        throw new Error('Failed to create campaign');
      }

      const newCampaign = await response.json();
      
      setState(prev => ({
        ...prev,
        campaigns: [...prev.campaigns, newCampaign],
        successMessage: 'Campaign created successfully',
        isLoading: false
      }));

      if (process.env.NODE_ENV !== 'test') {
        setTimeout(() => {
          setState(prev => ({ ...prev, successMessage: null }));
        }, 3000);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create campaign',
        isLoading: false
      }));
    }
  };

  const handleUpdateCampaign = async (campaignId: string, campaignData: UpdateCampaignInput) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) {
        throw new Error('Failed to update campaign');
      }

      const updatedCampaign = await response.json();
      
      setState(prev => ({
        ...prev,
        campaigns: prev.campaigns.map(c => c.id === campaignId ? updatedCampaign : c),
        successMessage: 'Campaign updated successfully',
        isLoading: false
      }));

      if (process.env.NODE_ENV !== 'test') {
        setTimeout(() => {
          setState(prev => ({ ...prev, successMessage: null }));
        }, 3000);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update campaign',
        isLoading: false
      }));
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete campaign');
      }

      setState(prev => ({
        ...prev,
        campaigns: prev.campaigns.filter(c => c.id !== campaignId),
        successMessage: 'Campaign deleted successfully',
        isLoading: false
      }));

      if (process.env.NODE_ENV !== 'test') {
        setTimeout(() => {
          setState(prev => ({ ...prev, successMessage: null }));
        }, 3000);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete campaign',
        isLoading: false
      }));
    }
  };

  if (status === 'loading' || state.isLoading) {
    return <Loader />;
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{state.error}</p>
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
        <h1 className="text-3xl font-bold mb-8">Campaigns - Winston AI</h1>
        
        {state.successMessage && (
          <div className="mb-4 bg-green-900/50 border border-green-500 rounded-lg p-4">
            {state.successMessage}
          </div>
        )}
        
        <CampaignCreator
          leads={state.leads}
          templates={state.templates}
          segments={state.segments}
          onCreateCampaign={handleCreateCampaign}
          onUpdateCampaign={handleUpdateCampaign}
          onDeleteCampaign={handleDeleteCampaign}
        />
      </div>
    </div>
  );
}; 