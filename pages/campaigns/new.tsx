import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/components/AuthProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import { supabase } from '@/lib/supabaseClient';
import { CreateCampaignInput } from '@/types/campaign';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { showErrorToast } from '@/lib/error';

const steps = [
  { id: 'basics', name: 'Basic Info' },
  { id: 'template', name: 'Email Template' },
  { id: 'audience', name: 'Target Audience' },
  { id: 'schedule', name: 'Schedule' },
  { id: 'review', name: 'Review' }
];

export default function NewCampaign() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState('basics');
  const [isLoading, setIsLoading] = useState(false);
  const [campaign, setCampaign] = useState<CreateCampaignInput>({
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
      time: undefined,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert([
          {
            ...campaign,
            userId: user?.id,
            status: 'draft'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      router.push(`/campaigns/${data.id}`);
    } catch (err) {
      showErrorToast('Failed to create campaign');
      console.error('Campaign creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'basics':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-200">
                Campaign Name
              </label>
              <Input
                type="text"
                value={campaign.name}
                onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
                placeholder="Enter campaign name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200">
                Description
              </label>
              <Textarea
                value={campaign.description}
                onChange={(e) => setCampaign({ ...campaign, description: e.target.value })}
                placeholder="Describe your campaign"
                rows={4}
              />
            </div>
          </div>
        );

      case 'template':
        return (
          <div className="space-y-6">
            <Select
              label="Email Template"
              value={campaign.templateId}
              onChange={(value) => setCampaign({ ...campaign, templateId: value })}
              options={[
                { value: 'template1', label: 'Welcome Email' },
                { value: 'template2', label: 'Newsletter' },
                { value: 'template3', label: 'Promotional' }
              ]}
            />
            <Button
              variant="secondary"
              onClick={() => router.push('/templates/new')}
            >
              Create New Template
            </Button>
          </div>
        );

      case 'audience':
        return (
          <div className="space-y-6">
            <Select
              label="Target Segment"
              value={campaign.segmentId}
              onChange={(value) => setCampaign({ ...campaign, segmentId: value })}
              options={[
                { value: 'segment1', label: 'All Users' },
                { value: 'segment2', label: 'Active Users' },
                { value: 'segment3', label: 'Inactive Users' }
              ]}
            />
            <Button
              variant="secondary"
              onClick={() => router.push('/segments/new')}
            >
              Create New Segment
            </Button>
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-6">
            <Select
              label="Schedule Type"
              value={campaign.schedule.type}
              onChange={(value) => setCampaign({
                ...campaign,
                schedule: {
                  ...campaign.schedule,
                  type: value as 'immediate' | 'scheduled'
                }
              })}
              options={[
                { value: 'immediate', label: 'Send Immediately' },
                { value: 'scheduled', label: 'Schedule for Later' }
              ]}
            />
            {campaign.schedule.type === 'scheduled' && (
              <>
                <Input
                  type="date"
                  value={campaign.schedule.date}
                  onChange={(e) => setCampaign({
                    ...campaign,
                    schedule: {
                      ...campaign.schedule,
                      date: e.target.value
                    }
                  })}
                  min={new Date().toISOString().split('T')[0]}
                />
                <Input
                  type="time"
                  value={campaign.schedule.time}
                  onChange={(e) => setCampaign({
                    ...campaign,
                    schedule: {
                      ...campaign.schedule,
                      time: e.target.value
                    }
                  })}
                />
              </>
            )}
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Review Campaign Details</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-400">Name</dt>
                <dd className="mt-1 text-sm text-white">{campaign.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-400">Description</dt>
                <dd className="mt-1 text-sm text-white">{campaign.description}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-400">Template</dt>
                <dd className="mt-1 text-sm text-white">{campaign.templateId}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-400">Segment</dt>
                <dd className="mt-1 text-sm text-white">{campaign.segmentId}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-400">Schedule</dt>
                <dd className="mt-1 text-sm text-white">
                  {campaign.schedule.type === 'immediate'
                    ? 'Send Immediately'
                    : `Scheduled for ${campaign.schedule.date} at ${campaign.schedule.time}`}
                </dd>
              </div>
            </dl>
          </div>
        );

      default:
        return null;
    }
  };

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Create New Campaign</h1>
          <p className="mt-2 text-sm text-gray-400">
            Set up your campaign details and schedule your email send.
          </p>
        </div>

        <div className="mb-8">
          <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
              {steps.map((step, index) => (
                <li
                  key={step.id}
                  className={`relative ${
                    index !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <button
                      onClick={() => setCurrentStep(step.id)}
                      className={`${
                        index <= currentStepIndex
                          ? 'bg-blue-600'
                          : 'bg-gray-700'
                      } h-8 w-8 rounded-full flex items-center justify-center`}
                    >
                      <span className="text-white">{index + 1}</span>
                    </button>
                    <span className="ml-4 text-sm font-medium text-gray-200">
                      {step.name}
                    </span>
                  </div>
                  {index !== steps.length - 1 && (
                    <div className="absolute top-4 left-8 -ml-px w-20 h-0.5 bg-gray-700" />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {renderStep()}

          <div className="flex justify-between pt-8">
            {!isFirstStep && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentStep(steps[currentStepIndex - 1].id)}
              >
                Previous
              </Button>
            )}
            <div className="flex-1" />
            {isLastStep ? (
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
              >
                {isLoading ? <Loader size="sm" /> : 'Create Campaign'}
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={() => setCurrentStep(steps[currentStepIndex + 1].id)}
              >
                Next
              </Button>
            )}
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
} 