import React, { useState } from 'react';
import { 
  RocketLaunchIcon, 
  EnvelopeIcon, 
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  PlusIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface Campaign {
  id: string;
  name: string;
  description: string;
  templateId: string;
  leadIds: string[];
  schedule: {
    startDate: string;
    endDate?: string;
    timeZone: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    daysOfWeek?: number[];
    timeOfDay: string;
  };
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  stats: {
    totalLeads: number;
    emailsSent: number;
    opens: number;
    replies: number;
    meetings: number;
  };
}

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  title: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
}

interface CampaignCreatorProps {
  leads: Lead[];
  templates: EmailTemplate[];
  onCreateCampaign: (campaign: Omit<Campaign, 'id' | 'stats'>) => void;
  onUpdateCampaign: (campaignId: string, updates: Partial<Campaign>) => void;
  onDeleteCampaign: (campaignId: string) => void;
}

const CampaignCreator: React.FC<CampaignCreatorProps> = ({
  leads,
  templates,
  onCreateCampaign,
  onUpdateCampaign,
  onDeleteCampaign
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState<Omit<Campaign, 'id' | 'stats'>>({
    name: '',
    description: '',
    templateId: '',
    leadIds: [],
    schedule: {
      startDate: new Date().toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      frequency: 'daily',
      timeOfDay: '09:00'
    },
    status: 'draft'
  });

  const handleCreateCampaign = () => {
    onCreateCampaign(newCampaign);
    setNewCampaign({
      name: '',
      description: '',
      templateId: '',
      leadIds: [],
      schedule: {
        startDate: new Date().toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        frequency: 'daily',
        timeOfDay: '09:00'
      },
      status: 'draft'
    });
    setShowCreateModal(false);
  };

  const handleLeadSelection = (leadId: string) => {
    setNewCampaign(prev => ({
      ...prev,
      leadIds: prev.leadIds.includes(leadId)
        ? prev.leadIds.filter(id => id !== leadId)
        : [...prev.leadIds, leadId]
    }));
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <RocketLaunchIcon className="h-6 w-6 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-white">Campaigns</h3>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Create Campaign
        </button>
      </div>

      {/* Campaign List */}
      <div className="space-y-4">
        {/* Placeholder for existing campaigns */}
        <div className="text-gray-400 text-center py-8">
          No campaigns created yet. Click "Create Campaign" to get started.
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-medium text-white mb-4">Create New Campaign</h3>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400">Campaign Name</label>
                  <input
                    type="text"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter campaign name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Description</label>
                  <textarea
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                    rows={3}
                    placeholder="Enter campaign description"
                  />
                </div>
              </div>

              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-400">Email Template</label>
                <select
                  value={newCampaign.templateId}
                  onChange={(e) => setNewCampaign({ ...newCampaign, templateId: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                >
                  <option value="">Select a template</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lead Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-400">Select Leads</label>
                <div className="mt-2 max-h-60 overflow-y-auto bg-gray-700 rounded-md">
                  {leads.map(lead => (
                    <div
                      key={lead.id}
                      className="flex items-center p-3 border-b border-gray-600 hover:bg-gray-600 cursor-pointer"
                      onClick={() => handleLeadSelection(lead.id)}
                    >
                      <input
                        type="checkbox"
                        checked={newCampaign.leadIds.includes(lead.id)}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-600 rounded border-gray-600"
                      />
                      <div className="ml-3">
                        <p className="text-white">{lead.name}</p>
                        <p className="text-sm text-gray-400">{lead.title} at {lead.company}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule Settings */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-400">Schedule Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Start Date</label>
                    <input
                      type="datetime-local"
                      value={newCampaign.schedule.startDate}
                      onChange={(e) => setNewCampaign({
                        ...newCampaign,
                        schedule: { ...newCampaign.schedule, startDate: e.target.value }
                      })}
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Frequency</label>
                    <select
                      value={newCampaign.schedule.frequency}
                      onChange={(e) => setNewCampaign({
                        ...newCampaign,
                        schedule: { ...newCampaign.schedule, frequency: e.target.value as any }
                      })}
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Time of Day</label>
                    <input
                      type="time"
                      value={newCampaign.schedule.timeOfDay}
                      onChange={(e) => setNewCampaign({
                        ...newCampaign,
                        schedule: { ...newCampaign.schedule, timeOfDay: e.target.value }
                      })}
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Time Zone</label>
                    <select
                      value={newCampaign.schedule.timeZone}
                      onChange={(e) => setNewCampaign({
                        ...newCampaign,
                        schedule: { ...newCampaign.schedule, timeZone: e.target.value }
                      })}
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCampaign}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <CheckIcon className="h-5 w-5 mr-1" />
                  Create Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignCreator; 