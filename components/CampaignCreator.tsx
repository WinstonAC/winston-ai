import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  ExclamationTriangleIcon,
  Trash2
} from '@heroicons/react/24/outline';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import Loader from '@/components/Loader';
import { 
  Campaign, 
  CampaignCreatorProps, 
  CreateCampaignInput,
  UpdateCampaignInput
} from '@/types/campaign';
import { toast } from 'react-hot-toast';

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const defaultCampaignInput: CreateCampaignInput = {
    name: '',
    description: '',
    templateId: '',
    targetAudience: {
      segment: '',
      filters: {},
    },
    schedule: {
      type: 'immediate',
    }
  };

  const [campaignInput, setCampaignInput] = useState<CreateCampaignInput>(defaultCampaignInput);

  // Memoize the campaign list to prevent unnecessary re-renders
  const campaignList = useMemo(() => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <div
          key={campaign.id}
          className="bg-black border-2 border-[#32CD32] p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-mono text-[#32CD32]">{campaign.name}</h3>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedCampaign(campaign);
                  setCampaignInput({
                    name: campaign.name,
                    description: campaign.description,
                    templateId: campaign.templateId,
                    targetAudience: campaign.targetAudience || { segment: '', filters: {} },
                    schedule: campaign.schedule,
                  });
                  setIsModalOpen(true);
                }}
                role="button"
                name="edit-campaign"
                aria-label={`Edit campaign ${campaign.name}`}
              >
                <PencilIcon className="h-5 w-5" aria-hidden="true" />
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowDeleteConfirm(campaign.id)}
                role="button"
                name="delete-campaign"
                aria-label={`Delete campaign ${campaign.name}`}
              >
                <TrashIcon className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
          </div>
          <p className="text-gray-400 font-mono mb-4">{campaign.description}</p>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 text-sm font-mono">
            <div>
              <dt className="text-gray-400">TEMPLATE_</dt>
              <dd className="text-[#32CD32]">
                {templates.find((t) => t.id === campaign.templateId)?.name || 'No template'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">TARGET_</dt>
              <dd className="text-[#32CD32]">
                {campaign.targetAudience?.segment || 'No target segment'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">SCHEDULE_</dt>
              <dd className="text-[#32CD32]">
                {campaign.schedule?.type === 'immediate'
                  ? 'SEND_NOW_'
                  : campaign.schedule?.date && campaign.schedule?.time
                    ? `SCHEDULED_${new Date(
                        `${campaign.schedule.date} ${campaign.schedule.time}`
                      ).toLocaleString()}`
                    : 'No schedule set'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">STATUS_</dt>
              <dd className="text-[#32CD32]">{campaign.status?.toUpperCase() || 'UNKNOWN'}_</dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  ), [campaigns, templates]);

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchCampaigns = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/campaigns');
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      const data = await response.json();
      setCampaigns(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch campaigns');
      setCampaigns([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
    // Cleanup function
    return () => {
      // Cleanup any subscriptions or event listeners if needed
    };
  }, [fetchCampaigns]);

  const validateCampaign = (input: CreateCampaignInput): boolean => {
    const errors: ValidationErrors = {};
    
    if (!input.name.trim()) {
      errors.name = 'Campaign name is required';
    }
    
    if (!input.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!input.templateId) {
      errors.templateId = 'Please select an email template';
    }
    
    if (!input.targetAudience.segment) {
      errors.targetAudience = { segment: 'Please select a target segment' };
    }
    
    if (input.schedule.type === 'scheduled') {
      if (!input.schedule.date) {
        errors.schedule = { ...errors.schedule, date: 'Please select a date' };
      }
      if (!input.schedule.time) {
        errors.schedule = { ...errors.schedule, time: 'Please select a time' };
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCampaign(campaignInput)) return;

    setIsCreating(true);
    setError(null);
    
    try {
      if (selectedCampaign) {
        await onUpdateCampaign(selectedCampaign.id, campaignInput);
        toast.success('Campaign updated successfully');
      } else {
        await onCreateCampaign(campaignInput);
        toast.success('Campaign created successfully');
      }
      
      setIsModalOpen(false);
      resetForm();
      await fetchCampaigns();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await onDeleteCampaign(id);
      toast.success('Campaign deleted successfully');
      setShowDeleteConfirm(null);
      await fetchCampaigns();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCampaignInput(defaultCampaignInput);
    setSelectedCampaign(null);
    setValidationErrors({});
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-mono text-[#32CD32]">EMAIL_CAMPAIGNS_</h2>
        <Button
          variant="primary"
          onClick={handleOpenCreateModal}
          role="button"
          name="open-create-campaign-modal"
          aria-label="Create new campaign"
        >
          Create Campaign
        </Button>
      </div>

      {error && (
        <div className="border-2 border-red-500 bg-black p-4">
          <div className="text-sm text-red-500 font-mono">Error: {error}</div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : (
        campaignList
      )}

      {successMessage && (
        <div className="border-2 border-[#32CD32] bg-black p-4">
          <div className="text-sm text-[#32CD32] font-mono">{successMessage}</div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={selectedCampaign ? 'Update Campaign' : 'Create Campaign'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Campaign name"
            name="name"
            value={campaignInput.name}
            onChange={(e) => setCampaignInput({ ...campaignInput, name: e.target.value })}
            error={validationErrors.name}
          />
          
          <Textarea
            label="Campaign description"
            name="description"
            value={campaignInput.description}
            onChange={(e) => setCampaignInput({ ...campaignInput, description: e.target.value })}
            error={validationErrors.description}
          />
          
          <Select
            label="Select email template"
            name="templateId"
            value={campaignInput.templateId}
            onChange={(e) => setCampaignInput({ ...campaignInput, templateId: e.target.value })}
            error={validationErrors.templateId}
          >
            <option value="">Select a template</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </Select>
          
          <Select
            label="Select target segment"
            name="targetSegment"
            value={campaignInput.targetAudience.segment}
            onChange={(e) => setCampaignInput({
              ...campaignInput,
              targetAudience: { ...campaignInput.targetAudience, segment: e.target.value }
            })}
            error={validationErrors.targetAudience?.segment}
          >
            <option value="">Select a segment</option>
            {segments.map((segment) => (
              <option key={segment.id} value={segment.id}>
                {segment.name}
              </option>
            ))}
          </Select>

          <Button
            type="submit"
            disabled={isCreating}
            aria-label={selectedCampaign ? 'submit-update-campaign' : 'submit-create-campaign'}
            className="w-full"
          >
            {isCreating ? (
              <Loader className="w-5 h-5" />
            ) : selectedCampaign ? (
              'Update Campaign'
            ) : (
              'Create Campaign'
            )}
          </Button>
        </form>
      </Modal>

      {showDeleteConfirm && (
        <Modal
          isOpen={!!showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(null)}
          title="Confirm Delete"
        >
          <div className="space-y-4">
            <p className="text-gray-400">Are you sure you want to delete this campaign?</p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(showDeleteConfirm)}
                aria-label="confirm-delete"
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CampaignCreator; 