import React, { useState, useEffect } from 'react';
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
  CheckIcon,
  PencilIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Campaign {
  id: string;
  name: string;
  description: string;
  templateId: string;
  targetAudience: {
    segment: string;
    filters: Record<string, any>;
  };
  schedule: {
    type: 'immediate' | 'scheduled';
    date?: string;
    time?: string;
  };
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  metrics?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
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
  segments: Array<{ id: string; name: string }>;
  onCreateCampaign: (campaign: Omit<Campaign, 'id' | 'status' | 'metrics'>) => Promise<void>;
  onUpdateCampaign: (campaign: Campaign) => Promise<void>;
  onDeleteCampaign: (id: string) => Promise<void>;
}

interface ValidationErrors {
  name?: string;
  description?: string;
  templateId?: string;
  targetAudience?: {
    segment?: string;
  };
  schedule?: {
    date?: string;
    time?: string;
  };
}

const CampaignCreator: React.FC<CampaignCreatorProps> = ({
  leads,
  templates,
  segments,
  onCreateCampaign,
  onUpdateCampaign,
  onDeleteCampaign
}) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const [newCampaign, setNewCampaign] = useState<Omit<Campaign, 'id' | 'status' | 'metrics'>>({
    name: '',
    description: '',
    templateId: '',
    targetAudience: {
      segment: '',
      filters: {},
    },
    schedule: {
      type: 'immediate',
    },
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement API call to fetch campaigns
      const response = await fetch('/api/campaigns');
      const data = await response.json();
      setCampaigns(data);
    } catch (err) {
      setError('Failed to fetch campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const validateCampaign = (campaign: Campaign | Omit<Campaign, 'id' | 'status' | 'metrics'>): boolean => {
    const errors: ValidationErrors = {};
    
    if (!campaign.name.trim()) {
      errors.name = 'Campaign name is required';
    }
    
    if (!campaign.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!campaign.templateId) {
      errors.templateId = 'Please select an email template';
    }
    
    if (!campaign.targetAudience.segment) {
      errors.targetAudience = { segment: 'Please select a target segment' };
    }
    
    if (campaign.schedule.type === 'scheduled') {
      if (!campaign.schedule.date) {
        errors.schedule = { ...errors.schedule, date: 'Please select a date' };
      }
      if (!campaign.schedule.time) {
        errors.schedule = { ...errors.schedule, time: 'Please select a time' };
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateCampaign = async () => {
    if (!validateCampaign(newCampaign)) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onCreateCampaign(newCampaign);
      setIsCreating(false);
      setNewCampaign({
        name: '',
        description: '',
        templateId: '',
        targetAudience: {
          segment: '',
          filters: {},
        },
        schedule: {
          type: 'immediate',
        },
      });
      setSuccessMessage('Campaign created successfully!');
      fetchCampaigns();
    } catch (err) {
      setError('Failed to create campaign');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateCampaign = async (campaign: Campaign) => {
    if (!validateCampaign(campaign)) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onUpdateCampaign(campaign);
      setSelectedCampaign(null);
      setSuccessMessage('Campaign updated successfully!');
      fetchCampaigns();
    } catch (err) {
      setError('Failed to update campaign');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      setIsSaving(true);
      setError(null);
      await onDeleteCampaign(id);
      setShowDeleteConfirm(null);
      setSuccessMessage('Campaign deleted successfully!');
      fetchCampaigns();
    } catch (err) {
      setError('Failed to delete campaign');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Email Campaigns</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Campaign
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200"
            >
              <div className="px-4 py-5 sm:px-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">{campaign.name}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedCampaign(campaign)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(campaign.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500">{campaign.description}</p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Template</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {templates.find((t) => t.id === campaign.templateId)?.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Target Segment</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {segments.find((s) => s.id === campaign.targetAudience.segment)?.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Schedule</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {campaign.schedule.type === 'immediate'
                        ? 'Send Immediately'
                        : `Scheduled for ${new Date(
                            `${campaign.schedule.date} ${campaign.schedule.time}`
                          ).toLocaleString()}`}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          campaign.status === 'sent'
                            ? 'bg-green-100 text-green-800'
                            : campaign.status === 'sending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : campaign.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
              {campaign.metrics && (
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <ChartBarIcon className="h-5 w-5 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-500">
                          {campaign.metrics.sent} sent
                        </span>
                      </div>
                      <div className="flex items-center">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-500">
                          {campaign.metrics.opened} opened
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {Math.round(
                        (campaign.metrics.opened / campaign.metrics.sent) * 100
                      )}
                      % open rate
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Campaign</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                    validationErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newCampaign.description}
                  onChange={(e) =>
                    setNewCampaign({ ...newCampaign, description: e.target.value })
                  }
                  rows={3}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                    validationErrors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                />
                {validationErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Template</label>
                <select
                  value={newCampaign.templateId}
                  onChange={(e) =>
                    setNewCampaign({ ...newCampaign, templateId: e.target.value })
                  }
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                    validationErrors.templateId ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                >
                  <option value="">Select a template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
                {validationErrors.templateId && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.templateId}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Target Segment</label>
                <select
                  value={newCampaign.targetAudience.segment}
                  onChange={(e) =>
                    setNewCampaign({
                      ...newCampaign,
                      targetAudience: {
                        ...newCampaign.targetAudience,
                        segment: e.target.value,
                      },
                    })
                  }
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                    validationErrors.targetAudience?.segment ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                >
                  <option value="">Select a segment</option>
                  {segments.map((segment) => (
                    <option key={segment.id} value={segment.id}>
                      {segment.name}
                    </option>
                  ))}
                </select>
                {validationErrors.targetAudience?.segment && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.targetAudience.segment}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Schedule</label>
                <div className="mt-1 space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="immediate"
                      name="schedule"
                      value="immediate"
                      checked={newCampaign.schedule.type === 'immediate'}
                      onChange={(e) =>
                        setNewCampaign({
                          ...newCampaign,
                          schedule: { type: 'immediate' },
                        })
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="immediate" className="ml-3 block text-sm text-gray-700">
                      Send Immediately
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="scheduled"
                      name="schedule"
                      value="scheduled"
                      checked={newCampaign.schedule.type === 'scheduled'}
                      onChange={(e) =>
                        setNewCampaign({
                          ...newCampaign,
                          schedule: { type: 'scheduled', date: '', time: '' },
                        })
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="scheduled" className="ml-3 block text-sm text-gray-700">
                      Schedule for later
                    </label>
                  </div>
                  {newCampaign.schedule.type === 'scheduled' && (
                    <div className="ml-7 space-y-2">
                      <input
                        type="date"
                        value={newCampaign.schedule.date}
                        onChange={(e) =>
                          setNewCampaign({
                            ...newCampaign,
                            schedule: {
                              ...newCampaign.schedule,
                              date: e.target.value,
                            },
                          })
                        }
                        className={`block w-full rounded-md shadow-sm sm:text-sm ${
                          validationErrors.schedule?.date ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                        }`}
                      />
                      <input
                        type="time"
                        value={newCampaign.schedule.time}
                        onChange={(e) =>
                          setNewCampaign({
                            ...newCampaign,
                            schedule: {
                              ...newCampaign.schedule,
                              time: e.target.value,
                            },
                          })
                        }
                        className={`block w-full rounded-md shadow-sm sm:text-sm ${
                          validationErrors.schedule?.time ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                        }`}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsCreating(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCampaign}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Campaign Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Campaign</h3>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
                <input
                  type="text"
                  value={selectedCampaign.name}
                  onChange={(e) => setSelectedCampaign({ ...selectedCampaign, name: e.target.value })}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                    validationErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={selectedCampaign.description}
                  onChange={(e) => setSelectedCampaign({ ...selectedCampaign, description: e.target.value })}
                  rows={3}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                    validationErrors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                />
                {validationErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Template</label>
                <select
                  value={selectedCampaign.templateId}
                  onChange={(e) => setSelectedCampaign({ ...selectedCampaign, templateId: e.target.value })}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                    validationErrors.templateId ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                >
                  <option value="">Select a template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
                {validationErrors.templateId && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.templateId}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Target Segment</label>
                <select
                  value={selectedCampaign.targetAudience.segment}
                  onChange={(e) => setSelectedCampaign({
                    ...selectedCampaign,
                    targetAudience: {
                      ...selectedCampaign.targetAudience,
                      segment: e.target.value,
                    },
                  })}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                    validationErrors.targetAudience?.segment ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                >
                  <option value="">Select a segment</option>
                  {segments.map((segment) => (
                    <option key={segment.id} value={segment.id}>
                      {segment.name}
                    </option>
                  ))}
                </select>
                {validationErrors.targetAudience?.segment && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.targetAudience.segment}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Schedule</label>
                <div className="mt-1 space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="edit-immediate"
                      name="edit-schedule"
                      value="immediate"
                      checked={selectedCampaign.schedule.type === 'immediate'}
                      onChange={(e) => setSelectedCampaign({
                        ...selectedCampaign,
                        schedule: { type: 'immediate' },
                      })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="edit-immediate" className="ml-3 block text-sm text-gray-700">
                      Send Immediately
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="edit-scheduled"
                      name="edit-schedule"
                      value="scheduled"
                      checked={selectedCampaign.schedule.type === 'scheduled'}
                      onChange={(e) => setSelectedCampaign({
                        ...selectedCampaign,
                        schedule: { type: 'scheduled', date: '', time: '' },
                      })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="edit-scheduled" className="ml-3 block text-sm text-gray-700">
                      Schedule for later
                    </label>
                  </div>
                  {selectedCampaign.schedule.type === 'scheduled' && (
                    <div className="ml-7 space-y-2">
                      <input
                        type="date"
                        value={selectedCampaign.schedule.date}
                        onChange={(e) => setSelectedCampaign({
                          ...selectedCampaign,
                          schedule: {
                            ...selectedCampaign.schedule,
                            date: e.target.value,
                          },
                        })}
                        className={`block w-full rounded-md shadow-sm sm:text-sm ${
                          validationErrors.schedule?.date ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                        }`}
                      />
                      <input
                        type="time"
                        value={selectedCampaign.schedule.time}
                        onChange={(e) => setSelectedCampaign({
                          ...selectedCampaign,
                          schedule: {
                            ...selectedCampaign.schedule,
                            time: e.target.value,
                          },
                        })}
                        className={`block w-full rounded-md shadow-sm sm:text-sm ${
                          validationErrors.schedule?.time ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                        }`}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateCampaign(selectedCampaign)}
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Delete Campaign</h3>
                <div className="mt-2 text-sm text-gray-500">
                  Are you sure you want to delete this campaign? This action cannot be undone.
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCampaign(showDeleteConfirm)}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {isSaving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="fixed bottom-4 right-4">
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckIcon className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={() => setSuccessMessage(null)}
                    className="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignCreator; 