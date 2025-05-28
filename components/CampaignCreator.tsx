import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
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
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import Loader from '@/components/Loader';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Campaign, 
  CampaignCreatorProps, 
  CreateCampaignInput,
  UpdateCampaignInput
} from '@/types/campaign';
import { Lead } from '@/types/lead';
import { Template } from '@/types/template';
import toast from 'react-hot-toast';
import { AppError, handleError, showErrorToast } from '../lib/error';
import { supabase } from '@/lib/supabase';
import { emailSchema, nameSchema, validateInput } from '@/lib/validation';

interface ValidationErrors {
  name?: string;
  description?: string;
  templateId?: string;
  segmentId?: string;
  targetAudience?: {
    segment?: string;
  };
  schedule?: {
    date?: string;
    time?: string;
  };
}

interface ApiResponse<T> {
  data: T;
  error: Error | null;
  pagination?: {
    totalPages: number;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [campaignInput, setCampaignInput] = useState<CreateCampaignInput>({
    name: '',
    description: '',
    templateId: '',
    segmentId: '',
    targetAudience: {
      segment: '',
      filters: {}
    },
    schedule: {
      type: 'immediate',
      date: undefined,
      time: undefined
    }
  });

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
                variant="outline"
                onClick={() => {
                  setSelectedCampaign(campaign);
                  setCampaignInput({
                    name: campaign.name,
                    description: campaign.description,
                    templateId: campaign.templateId,
                    segmentId: campaign.segmentId,
                    targetAudience: campaign.targetAudience || { segment: '', filters: {} },
                    schedule: {
                      type: campaign.schedule?.type || 'immediate',
                      date: campaign.schedule?.date,
                      time: campaign.schedule?.time
                    }
                  });
                  setIsModalOpen(true);
                }}
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
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
              <dt className="text-gray-400">SEGMENT_</dt>
              <dd className="text-[#32CD32]">
                {segments.find((s) => s.id === campaign.segmentId)?.name || 'No segment'}
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
  ), [campaigns, templates, segments]);

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchCampaigns = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<ApiResponse<Campaign[]>>('campaigns', {
        enableCache: true,
        cacheKey: `campaigns-${currentPage}-${pageSize}`,
        pagination: {
          page: currentPage,
          pageSize,
        },
      });
      
      if (response.error) throw response.error;
      
      setCampaigns(response.data || []);
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages);
      }
    } catch (err) {
      const appError = handleError(err);
      setError(appError.message);
      showErrorToast(appError);
      setCampaigns([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

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
    
    if (!input.segmentId) {
      errors.segmentId = 'Please select a segment';
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

    try {
      setIsCreating(true);
      setError(null);
      
      const response = await api.post<ApiResponse<Campaign>>('campaigns', {
        ...campaignInput,
        targetAudience: campaignInput.targetAudience || { segment: '', filters: {} }
      });
      
      if (response.error) throw response.error;
      
      if (response.data) {
        onCreateCampaign?.({
          ...response.data,
          targetAudience: response.data.targetAudience || { segment: '', filters: {} }
        });
        setSuccessMessage('Campaign created successfully');
      }
    } catch (err) {
      const appError = handleError(err);
      setError(appError.message);
      showErrorToast(appError);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.delete<ApiResponse<void>>(`campaigns/${id}`);
      
      if (response.error) throw response.error;
      
      onDeleteCampaign?.(id);
      setSuccessMessage('Campaign deleted successfully');
      
      // Refresh campaigns list
      await fetchCampaigns();
    } catch (err) {
      const appError = handleError(err);
      setError(appError.message);
      showErrorToast(appError);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(null);
    }
  };

  const resetForm = () => {
    setCampaignInput({
      name: '',
      description: '',
      templateId: '',
      segmentId: '',
      targetAudience: {
        segment: '',
        filters: {}
      },
      schedule: {
        type: 'immediate',
        date: undefined,
        time: undefined
      }
    });
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
          variant="default"
          onClick={handleOpenCreateModal}
          role="button"
          name="open-create-campaign-modal"
          aria-label="Create new campaign"
          disabled={isLoading}
        >
          {isLoading ? <Loader /> : 'Create Campaign'}
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

      {!isLoading && campaigns.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Show</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
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
          <div className="space-y-1">
            <label htmlFor="campaign-name" className="block text-sm font-bold">
              Campaign name
            </label>
            <div className="relative">
              <input
                id="campaign-name"
                name="name"
                value={campaignInput.name}
                onChange={(e) => setCampaignInput({ ...campaignInput, name: e.target.value })}
                className="w-full p-2 border-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black border-black text-base px-3 py-2"
              />
            </div>
          </div>
          <div className="w-full">
            <label htmlFor="campaign-description" className="block text-sm font-medium text-gray-200 mb-1">
              Campaign description
            </label>
            <textarea
              id="campaign-description"
              name="description"
              value={campaignInput.description}
              onChange={(e) => setCampaignInput({ ...campaignInput, description: e.target.value })}
              className="block w-full rounded-lg border bg-black text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y min-h-[100px] border-gray-700 hover:border-gray-600"
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="template" className="block text-sm font-medium text-gray-200">
                Email Template
              </label>
              <div className="w-full">
                <select
                  id="template"
                  name="templateId"
                  value={campaignInput.templateId}
                  onChange={(e) => setCampaignInput({ ...campaignInput, templateId: e.target.value })}
                  className="block w-full rounded-lg border bg-black text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-gray-700 hover:border-gray-600"
                >
                  <option value="">Select an option</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="segment" className="block text-sm font-medium text-gray-200">
                Segment
              </label>
              <div className="w-full">
                <select
                  id="segment"
                  name="segmentId"
                  value={campaignInput.segmentId}
                  onChange={(e) => setCampaignInput({ ...campaignInput, segmentId: e.target.value })}
                  className="block w-full rounded-lg border bg-black text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-gray-700 hover:border-gray-600"
                >
                  <option value="">Select an option</option>
                  {segments.map((segment) => (
                    <option key={segment.id} value={segment.id}>
                      {segment.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="target-segment" className="block text-sm font-medium text-gray-200">
                Target Audience
              </label>
              <div className="w-full">
                <select
                  id="target-segment"
                  name="targetAudience.segment"
                  value={campaignInput.targetAudience?.segment}
                  onChange={(e) => setCampaignInput({
                    ...campaignInput,
                    targetAudience: {
                      ...campaignInput.targetAudience,
                      segment: e.target.value
                    }
                  })}
                  className="block w-full rounded-lg border bg-black text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-gray-700 hover:border-gray-600"
                >
                  <option value="">Select an option</option>
                  {segments.map((segment) => (
                    <option key={segment.id} value={segment.id}>
                      {segment.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="w-full">
            <label htmlFor="schedule-type" className="block text-sm font-medium text-gray-200 mb-1">
              Schedule type
            </label>
            <select
              id="schedule-type"
              name="schedule.type"
              value={campaignInput.schedule?.type}
              onChange={(e) => setCampaignInput({
                ...campaignInput,
                schedule: {
                  ...campaignInput.schedule,
                  type: e.target.value as 'immediate' | 'scheduled'
                }
              })}
              className="block w-full rounded-lg border bg-black text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-gray-700 hover:border-gray-600"
            >
              <option value="">Select an option</option>
              <option value="SEND_NOW">Send Now</option>
              <option value="SCHEDULE">Schedule</option>
            </select>
          </div>

          {campaignInput.schedule.type === 'scheduled' && (
            <>
              <Input
                type="date"
                label="Schedule date"
                name="schedule.date"
                value={campaignInput.schedule.date}
                onChange={(e) => setCampaignInput({
                  ...campaignInput,
                  schedule: {
                    ...campaignInput.schedule,
                    date: e.target.value
                  }
                })}
                error={validationErrors.schedule?.date}
                disabled={isCreating}
              />

              <Input
                type="time"
                label="Schedule time"
                name="schedule.time"
                value={campaignInput.schedule.time}
                onChange={(e) => setCampaignInput({
                  ...campaignInput,
                  schedule: {
                    ...campaignInput.schedule,
                    time: e.target.value
                  }
                })}
                error={validationErrors.schedule?.time}
                disabled={isCreating}
              />
            </>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isCreating}
            >
              {isCreating ? <Loader /> : (selectedCampaign ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </Modal>

      {showDeleteConfirm && (
        <Modal
          isOpen={!!showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(null)}
          title="Confirm Delete"
        >
          <div className="space-y-4">
            <p className="text-gray-400">
              Are you sure you want to delete this campaign? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={isLoading}
              >
                {isLoading ? <Loader /> : 'Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CampaignCreator; 