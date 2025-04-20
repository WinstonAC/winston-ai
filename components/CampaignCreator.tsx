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
    if (!validateCampaign(newCampaign)) return;

    setIsCreating(true);
    setError(null);
    try {
      const response = await fetch('/api/sendCampaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCampaign.name,
          description: newCampaign.description,
          templateId: newCampaign.templateId,
          targetAudience: newCampaign.targetAudience,
          schedule: newCampaign.schedule,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create campaign');
      }

      const data = await response.json();
      setCampaigns(prev => [...prev, data]);
      setSuccessMessage('Campaign created successfully!');
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateCampaign = async (campaign: Campaign) => {
    if (!validateCampaign(campaign)) return;

    try {
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

      const updatedCampaign = await response.json();
      setCampaigns(prev => prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c));
      setSuccessMessage('Campaign updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update campaign');
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete campaign');
      }

      setCampaigns(prev => prev.filter(c => c.id !== id));
      setSuccessMessage('Campaign deleted successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete campaign');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-mono text-[#32CD32]">EMAIL_CAMPAIGNS_</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-black border-2 border-[#32CD32] px-4 py-2 text-[#32CD32] font-mono
                   hover:bg-[#32CD32] hover:text-black transition-colors"
        >
          <PlusIcon className="h-5 w-5 inline-block mr-2" />
          CREATE_CAMPAIGN_
        </button>
      </div>

      {error && (
        <div className="border-2 border-red-500 bg-black p-4">
          <div className="text-sm text-red-500 font-mono">{error}</div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#32CD32] border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-black border-2 border-[#32CD32] p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-mono text-[#32CD32]">{campaign.name}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedCampaign(campaign)}
                    className="text-[#32CD32] hover:text-white transition-colors"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(campaign.id)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <p className="text-gray-400 font-mono mb-4">{campaign.description}</p>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 text-sm font-mono">
                <div>
                  <dt className="text-gray-400">TEMPLATE_</dt>
                  <dd className="text-[#32CD32]">
                    {templates.find((t) => t.id === campaign.templateId)?.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-400">TARGET_</dt>
                  <dd className="text-[#32CD32]">
                    {segments.find((s) => s.id === campaign.targetAudience.segment)?.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-400">SCHEDULE_</dt>
                  <dd className="text-[#32CD32]">
                    {campaign.schedule.type === 'immediate'
                      ? 'SEND_NOW_'
                      : `SCHEDULED_${new Date(
                          `${campaign.schedule.date} ${campaign.schedule.time}`
                        ).toLocaleString()}_`}
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-black border-2 border-[#32CD32] p-6 max-w-2xl w-full">
            <h3 className="text-lg font-mono text-[#32CD32] mb-4">CREATE_NEW_CAMPAIGN_</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-[#32CD32] mb-2">CAMPAIGN_NAME_</label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  className="w-full bg-black border-2 border-[#32CD32] text-white px-4 py-2 font-mono
                           focus:outline-none focus:border-white"
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-500 font-mono">{validationErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-mono text-[#32CD32] mb-2">DESCRIPTION_</label>
                <textarea
                  value={newCampaign.description}
                  onChange={(e) =>
                    setNewCampaign({ ...newCampaign, description: e.target.value })
                  }
                  rows={3}
                  className="w-full bg-black border-2 border-[#32CD32] text-white px-4 py-2 font-mono
                           focus:outline-none focus:border-white"
                />
                {validationErrors.description && (
                  <p className="mt-1 text-sm text-red-500 font-mono">{validationErrors.description}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-mono text-[#32CD32] mb-2">EMAIL_TEMPLATE_</label>
                <select
                  value={newCampaign.templateId}
                  onChange={(e) =>
                    setNewCampaign({ ...newCampaign, templateId: e.target.value })
                  }
                  className="w-full bg-black border-2 border-[#32CD32] text-white px-4 py-2 font-mono
                           focus:outline-none focus:border-white"
                >
                  <option value="">Select a template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
                {validationErrors.templateId && (
                  <p className="mt-1 text-sm text-red-500 font-mono">{validationErrors.templateId}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-mono text-[#32CD32] mb-2">TARGET_SEGMENT_</label>
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
                  className="w-full bg-black border-2 border-[#32CD32] text-white px-4 py-2 font-mono
                           focus:outline-none focus:border-white"
                >
                  <option value="">Select a segment</option>
                  {segments.map((segment) => (
                    <option key={segment.id} value={segment.id}>
                      {segment.name}
                    </option>
                  ))}
                </select>
                {validationErrors.targetAudience?.segment && (
                  <p className="mt-1 text-sm text-red-500 font-mono">{validationErrors.targetAudience.segment}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-mono text-[#32CD32] mb-2">SCHEDULE_</label>
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
                      className="h-4 w-4 text-[#32CD32] focus:ring-[#32CD32] border-gray-300"
                    />
                    <label htmlFor="immediate" className="ml-3 block text-sm text-gray-300">
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
                      className="h-4 w-4 text-[#32CD32] focus:ring-[#32CD32] border-gray-300"
                    />
                    <label htmlFor="scheduled" className="ml-3 block text-sm text-gray-300">
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
                        className="w-full bg-black border-2 border-[#32CD32] text-white px-4 py-2 font-mono
                                 focus:outline-none focus:border-white"
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
                        className="w-full bg-black border-2 border-[#32CD32] text-white px-4 py-2 font-mono
                                 focus:outline-none focus:border-white"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 border-2 border-gray-500 text-gray-500 font-mono
                           hover:bg-gray-500 hover:text-black transition-colors"
                >
                  CANCEL_
                </button>
                <button
                  onClick={handleCreateCampaign}
                  className="px-4 py-2 border-2 border-[#32CD32] text-[#32CD32] font-mono
                           hover:bg-[#32CD32] hover:text-black transition-colors"
                >
                  CREATE_CAMPAIGN_
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Campaign Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-black border-2 border-[#32CD32] p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-mono text-[#32CD32]">EDIT_CAMPAIGN_</h3>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-[#32CD32] mb-2">CAMPAIGN_NAME_</label>
                <input
                  type="text"
                  value={selectedCampaign.name}
                  onChange={(e) => setSelectedCampaign({ ...selectedCampaign, name: e.target.value })}
                  className="w-full bg-black border-2 border-[#32CD32] text-white px-4 py-2 font-mono
                           focus:outline-none focus:border-white"
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-500 font-mono">{validationErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-mono text-[#32CD32] mb-2">DESCRIPTION_</label>
                <textarea
                  value={selectedCampaign.description}
                  onChange={(e) => setSelectedCampaign({ ...selectedCampaign, description: e.target.value })}
                  rows={3}
                  className="w-full bg-black border-2 border-[#32CD32] text-white px-4 py-2 font-mono
                           focus:outline-none focus:border-white"
                />
                {validationErrors.description && (
                  <p className="mt-1 text-sm text-red-500 font-mono">{validationErrors.description}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-mono text-[#32CD32] mb-2">EMAIL_TEMPLATE_</label>
                <select
                  value={selectedCampaign.templateId}
                  onChange={(e) => setSelectedCampaign({ ...selectedCampaign, templateId: e.target.value })}
                  className="w-full bg-black border-2 border-[#32CD32] text-white px-4 py-2 font-mono
                           focus:outline-none focus:border-white"
                >
                  <option value="">Select a template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
                {validationErrors.templateId && (
                  <p className="mt-1 text-sm text-red-500 font-mono">{validationErrors.templateId}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-mono text-[#32CD32] mb-2">TARGET_SEGMENT_</label>
                <select
                  value={selectedCampaign.targetAudience.segment}
                  onChange={(e) => setSelectedCampaign({
                    ...selectedCampaign,
                    targetAudience: {
                      ...selectedCampaign.targetAudience,
                      segment: e.target.value,
                    },
                  })}
                  className="w-full bg-black border-2 border-[#32CD32] text-white px-4 py-2 font-mono
                           focus:outline-none focus:border-white"
                >
                  <option value="">Select a segment</option>
                  {segments.map((segment) => (
                    <option key={segment.id} value={segment.id}>
                      {segment.name}
                    </option>
                  ))}
                </select>
                {validationErrors.targetAudience?.segment && (
                  <p className="mt-1 text-sm text-red-500 font-mono">{validationErrors.targetAudience.segment}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-mono text-[#32CD32] mb-2">SCHEDULE_</label>
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
                      className="h-4 w-4 text-[#32CD32] focus:ring-[#32CD32] border-gray-300"
                    />
                    <label htmlFor="edit-immediate" className="ml-3 block text-sm text-gray-300">
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
                      className="h-4 w-4 text-[#32CD32] focus:ring-[#32CD32] border-gray-300"
                    />
                    <label htmlFor="edit-scheduled" className="ml-3 block text-sm text-gray-300">
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
                        className="w-full bg-black border-2 border-[#32CD32] text-white px-4 py-2 font-mono
                                 focus:outline-none focus:border-white"
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
                        className="w-full bg-black border-2 border-[#32CD32] text-white px-4 py-2 font-mono
                                 focus:outline-none focus:border-white"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="px-4 py-2 border-2 border-gray-500 text-gray-500 font-mono
                           hover:bg-gray-500 hover:text-black transition-colors"
                >
                  CANCEL_
                </button>
                <button
                  onClick={() => handleUpdateCampaign(selectedCampaign)}
                  disabled={isCreating}
                  className="px-4 py-2 border-2 border-[#32CD32] text-[#32CD32] font-mono
                           hover:bg-[#32CD32] hover:text-black transition-colors"
                >
                  {isCreating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-black border-2 border-red-500 p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-mono text-red-500">DELETE_CAMPAIGN_</h3>
            </div>
            <p className="text-gray-400 font-mono mb-6">
              Are you sure you want to delete this campaign? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border-2 border-gray-500 text-gray-500 font-mono
                         hover:bg-gray-500 hover:text-black transition-colors"
              >
                CANCEL_
              </button>
              <button
                onClick={() => handleDeleteCampaign(showDeleteConfirm)}
                className="px-4 py-2 border-2 border-red-500 text-red-500 font-mono
                         hover:bg-red-500 hover:text-black transition-colors"
              >
                DELETE_
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="fixed bottom-4 right-4">
          <div className="bg-black border-2 border-[#32CD32] p-4">
            <div className="flex items-center">
              <CheckIcon className="h-5 w-5 text-[#32CD32] mr-3" />
              <p className="text-sm font-mono text-[#32CD32]">{successMessage}</p>
              <button
                onClick={() => setSuccessMessage(null)}
                className="ml-4 text-[#32CD32] hover:text-white"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignCreator; 