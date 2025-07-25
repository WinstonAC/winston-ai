import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

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
  const [campaign, setCampaign] = useState({
    name: '',
    description: '',
    templateId: '',
    segmentId: '',
    schedule: {
      type: 'immediate',
      date: '',
      time: ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Demo: Create campaign via API
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: campaign.name,
          description: campaign.description,
          status: 'draft'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create campaign');
      }

      const data = await response.json();
      console.log('Demo: Campaign created:', data);
      
      // For demo, redirect to campaigns list
      router.push('/campaigns');
    } catch (err) {
      console.error('Campaign creation error:', err);
      alert('Error creating campaign. Please try again.');
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
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                value={campaign.name}
                onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
                placeholder="Enter campaign name"
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Description
              </label>
              <textarea
                value={campaign.description}
                onChange={(e) => setCampaign({ ...campaign, description: e.target.value })}
                placeholder="Describe your campaign"
                rows={4}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
              />
            </div>
          </div>
        );

      case 'template':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Email Template
              </label>
              <select
                value={campaign.templateId}
                onChange={(e) => setCampaign({ ...campaign, templateId: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              >
                <option value="">Select template</option>
                <option value="template1">Welcome Email</option>
                <option value="template2">Product Demo</option>
                <option value="template3">Follow-up Email</option>
              </select>
            </div>
          </div>
        );

      case 'audience':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Target Segment
              </label>
              <select
                value={campaign.segmentId}
                onChange={(e) => setCampaign({ ...campaign, segmentId: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              >
                <option value="">Select segment</option>
                <option value="segment1">All Leads</option>
                <option value="segment2">New Leads</option>
                <option value="segment3">Qualified Leads</option>
              </select>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Schedule Type
              </label>
              <select
                value={campaign.schedule.type}
                onChange={(e) => setCampaign({
                  ...campaign,
                  schedule: {
                    ...campaign.schedule,
                    type: e.target.value
                  }
                })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              >
                <option value="immediate">Send Immediately</option>
                <option value="scheduled">Schedule for Later</option>
              </select>
            </div>
            {campaign.schedule.type === 'scheduled' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Date
                  </label>
                  <input
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
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={campaign.schedule.time}
                    onChange={(e) => setCampaign({
                      ...campaign,
                      schedule: {
                        ...campaign.schedule,
                        time: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  />
                </div>
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
    <div className="min-h-screen bg-black text-white">
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
              <button
                type="button"
                onClick={() => setCurrentStep(steps[currentStepIndex - 1].id)}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700"
              >
                Previous
              </button>
            )}
            <div className="flex-1" />
            {isLastStep ? (
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Campaign'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentStep(steps[currentStepIndex + 1].id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 