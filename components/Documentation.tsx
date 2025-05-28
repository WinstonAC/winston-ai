import React, { useState } from 'react';
import Link from 'next/link';
import { 
  CpuChipIcon, 
  ArrowsPointingOutIcon, 
  ChatBubbleLeftRightIcon, 
  CodeBracketIcon 
} from '@heroicons/react/24/outline';

const Documentation: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');

  const sections = [
    { id: 'overview', title: 'Overview' },
    { id: 'features', title: 'Features' },
    { id: 'examples', title: 'Usage Examples' },
    { id: 'navigation', title: 'Navigation' },
    { id: 'technical', title: 'Technical Details' },
    { id: 'developer', title: 'Developer Docs' }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-[#32CD32] hover:underline font-mono tracking-wider">
            Back to Home
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="sticky top-8">
              <h1 className="text-2xl font-mono tracking-wider mb-6">Chatbot Docs</h1>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg font-mono tracking-wider transition-colors ${
                      activeSection === section.id
                        ? 'bg-[#32CD32] text-black'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeSection === 'overview' && <OverviewSection />}
            {activeSection === 'features' && <FeaturesSection />}
            {activeSection === 'examples' && <ExamplesSection />}
            {activeSection === 'navigation' && <NavigationSection />}
            {activeSection === 'technical' && <TechnicalSection />}
            {activeSection === 'developer' && <DeveloperSection />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;

const OverviewSection: React.FC = () => (
  <section className="space-y-6">
    <h2 className="text-3xl font-mono tracking-wider mb-6">Overview</h2>
    <div className="bg-gray-900 p-8 rounded-lg">
      <p className="text-gray-300 mb-6 leading-relaxed">
        The Winston AI chatbot is a context-aware assistant that helps users navigate and interact with the application. It provides real-time information and can navigate between different sections of the application.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-[#32CD32] font-mono tracking-wider mb-2">Purpose</h3>
          <p className="text-gray-300">Help users navigate and interact with Winston AI efficiently</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-[#32CD32] font-mono tracking-wider mb-2">Location</h3>
          <p className="text-gray-300">Accessible from any page in the bottom-right corner</p>
        </div>
      </div>
    </div>
  </section>
);

const FeaturesSection: React.FC = () => (
  <section className="space-y-6">
    <h2 className="text-3xl font-mono tracking-wider mb-6">Features</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FeatureCard
        title="Context Awareness"
        description="The chatbot understands which page you're on and provides relevant information and commands."
        icon={<CpuChipIcon className="h-8 w-8" />}
      />
      <FeatureCard
        title="Navigation"
        description="Click on topics to navigate between pages or get specific information about features."
        icon={<ArrowsPointingOutIcon className="h-8 w-8" />}
      />
      <FeatureCard
        title="Real-time Interaction"
        description="Get instant responses to your queries with a typing animation for a natural feel."
        icon={<ChatBubbleLeftRightIcon className="h-8 w-8" />}
      />
      <FeatureCard
        title="Brutalist Design"
        description="Consistent with the application's aesthetic, featuring monospace font and lime green accents."
        icon={<CodeBracketIcon className="h-8 w-8" />}
      />
    </div>
  </section>
);

const FeatureCard: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({
  title,
  description,
  icon
}) => (
  <div className="bg-gray-900 p-6 rounded-lg hover:bg-gray-800 transition-colors border border-gray-700">
    <div className="text-[#32CD32] mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-mono tracking-wider mb-2 text-[#32CD32]">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </div>
);

const ExamplesSection: React.FC = () => (
  <section className="space-y-6">
    <h2 className="text-3xl font-mono tracking-wider mb-6">Usage Examples</h2>
    <div className="space-y-8">
      <ExampleCard
        title="Dashboard Interaction"
        userInput="View your lead stats"
        botResponses={[
          'Current metrics',
          'Leads: 123',
          'Active campaigns: 5',
          'Conversion rate: 12%'
        ]}
      />
      <ExampleCard
        title="Leads Management"
        userInput="Classify leads"
        botResponses={[
          'Lead classification',
          'Use the classification tool',
          'To tag and categorize leads'
        ]}
      />
      <ExampleCard
        title="Campaign Control"
        userInput="Create new campaign"
        botResponses={[
          'New campaign setup',
          '1. Select campaign type',
          '2. Define target audience',
          '3. Set objectives'
        ]}
      />
    </div>
  </section>
);

const ExampleCard: React.FC<{
  title: string;
  userInput: string;
  botResponses: string[];
}> = ({ title, userInput, botResponses }) => (
  <div className="bg-gray-900 p-6 rounded-lg">
    <h3 className="text-xl font-mono tracking-wider mb-4 text-[#32CD32]">{title}</h3>
    <div className="font-mono text-sm space-y-2">
      <p className="text-gray-400">User: {userInput}</p>
      {botResponses.map((response, index) => (
        <p key={index} className="text-[#32CD32]">{response}</p>
      ))}
    </div>
  </div>
);

const NavigationSection: React.FC = () => (
  <section className="space-y-6">
    <h2 className="text-3xl font-mono tracking-wider mb-6">Navigation</h2>
    <div className="bg-gray-900 p-6 rounded-lg">
      <p className="text-gray-300 mb-6">
        The chatbot can help you navigate between different sections of the application. Available navigation options depend on your current page:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-[#32CD32] font-mono tracking-wider mb-4">From Dashboard</h3>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              <span>Manage your campaigns → /campaigns</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              <span>Upload new leads → /leads</span>
            </li>
          </ul>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-[#32CD32] font-mono tracking-wider mb-4">From Leads or Campaigns</h3>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              <span>Go to dashboard → /dashboard</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
);

const TechnicalSection: React.FC = () => (
  <section className="space-y-6">
    <h2 className="text-3xl font-mono tracking-wider mb-6">Technical Details</h2>
    <div className="bg-gray-900 p-6 rounded-lg">
      <h3 className="text-xl font-mono tracking-wider mb-4 text-[#32CD32]">Implementation</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="font-mono tracking-wider mb-2 text-[#32CD32]">Technologies</h4>
          <ul className="space-y-2 text-gray-300">
            <li>• React Hooks</li>
            <li>• Next.js Router</li>
            <li>• Tailwind CSS</li>
            <li>• TypeScript</li>
          </ul>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="font-mono tracking-wider mb-2 text-[#32CD32]">Features</h4>
          <ul className="space-y-2 text-gray-300">
            <li>• Context-aware responses</li>
            <li>• Real-time updates</li>
            <li>• Smooth animations</li>
            <li>• Responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
);

const DeveloperSection: React.FC = () => (
  <section className="space-y-6">
    <h2 className="text-3xl font-mono tracking-wider mb-6">Developer Documentation</h2>
    
    <div className="bg-gray-900 p-6 rounded-lg space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-[#32CD32] font-mono tracking-wider mb-2">Project Structure</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• components/ - React components</li>
            <li>• pages/ - Next.js pages</li>
            <li>• prisma/ - Database schema</li>
            <li>• lib/ - Utility functions</li>
            <li>• hooks/ - Custom React hooks</li>
            <li>• types/ - TypeScript types</li>
          </ul>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-[#32CD32] font-mono tracking-wider mb-2">Tech Stack</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• Next.js & React</li>
            <li>• TypeScript</li>
            <li>• Tailwind CSS</li>
            <li>• Prisma ORM</li>
            <li>• Supabase Auth</li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-[#32CD32] font-mono tracking-wider mb-2">Feature Documentation</h3>
        <div className="space-y-4">
          <div className="text-gray-300">
            <h4 className="font-mono tracking-wider mb-2 text-[#32CD32]">Chatbot Features</h4>
            <ul className="space-y-2">
              <li>• Context-aware responses with page-specific information</li>
              <li>• Real-time interaction handling with typing animations</li>
              <li>• Navigation between pages via clickable topics</li>
              <li>• Analytics mode for data-specific queries</li>
              <li>• Custom command system with permission validation</li>
            </ul>
          </div>
          <div className="text-gray-300">
            <h4 className="font-mono tracking-wider mb-2 text-[#32CD32]">Team Management</h4>
            <ul className="space-y-2">
              <li>• Role-based access control (Admin, Manager, Member)</li>
              <li>• Team invitation system with email verification</li>
              <li>• Team activity tracking and analytics</li>
              <li>• Secure session management</li>
            </ul>
          </div>
          <div className="text-gray-300">
            <h4 className="font-mono tracking-wider mb-2 text-[#32CD32]">Campaign Management</h4>
            <ul className="space-y-2">
              <li>• Campaign creation and configuration</li>
              <li>• Real-time performance monitoring</li>
              <li>• Email template management</li>
              <li>• A/B testing capabilities</li>
              <li>• Analytics integration</li>
            </ul>
          </div>
          <div className="text-gray-300">
            <h4 className="font-mono tracking-wider mb-2 text-[#32CD32]">Lead Management</h4>
            <ul className="space-y-2">
              <li>• Lead creation and import</li>
              <li>• Automated lead scoring</li>
              <li>• Lead nurturing workflows</li>
              <li>• Team collaboration features</li>
              <li>• Analytics and reporting</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-[#32CD32] font-mono tracking-wider mb-2">API Endpoints</h3>
        <div className="space-y-4">
          <div className="text-gray-300">
            <p className="mb-2">Authentication:</p>
            <ul className="space-y-1">
              <li>• POST /api/auth/signin</li>
              <li>• POST /api/auth/signout</li>
              <li>• GET /api/auth/session</li>
              <li>• GET /api/auth/user</li>
            </ul>
          </div>
          <div className="text-gray-300">
            <p className="mb-2">Team Management:</p>
            <ul className="space-y-1">
              <li>• GET /api/team</li>
              <li>• POST /api/team/invite</li>
              <li>• PUT /api/team/member/:id</li>
            </ul>
          </div>
          <div className="text-gray-300">
            <p className="mb-2">Campaign Management:</p>
            <ul className="space-y-1">
              <li>• GET /api/campaigns</li>
              <li>• POST /api/campaigns</li>
              <li>• PUT /api/campaigns/:id</li>
              <li>• GET /api/campaigns/:id/analytics</li>
            </ul>
          </div>
          <div className="text-gray-300">
            <p className="mb-2">Lead Management:</p>
            <ul className="space-y-1">
              <li>• GET /api/leads</li>
              <li>• POST /api/leads</li>
              <li>• PUT /api/leads/:id</li>
              <li>• GET /api/leads/:id/activity</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-[#32CD32] font-mono tracking-wider mb-2">Database Schema</h3>
        <div className="text-gray-300">
          <p className="mb-2">Key Models:</p>
          <ul className="space-y-2">
            <li>• User - Authentication and profile data</li>
            <li>• Team - Team management and organization</li>
            <li>• Campaign - Marketing campaigns</li>
            <li>• Lead - Sales leads and contacts</li>
            <li>• ChatbotInteraction - Chatbot usage data</li>
            <li>• AnalyticsEvent - User activity tracking</li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-[#32CD32] font-mono tracking-wider mb-2">Full Documentation</h3>
        <p className="text-gray-300 mb-4">
          For complete developer documentation, including:
        </p>
        <ul className="space-y-2 text-gray-300">
          <li>• Detailed setup instructions</li>
          <li>• Environment configuration</li>
          <li>• Testing procedures</li>
          <li>• Deployment guide</li>
          <li>• Contributing guidelines</li>
          <li>• Feature implementation details</li>
          <li>• API reference</li>
          <li>• Security best practices</li>
        </ul>
        <div className="mt-4">
          <Link 
            href="/docs/CHATBOT_DEVELOPER_GUIDE.md" 
            className="text-[#32CD32] hover:underline font-mono tracking-wider"
          >
            VIEW_FULL_DEVELOPER_DOCS_
          </Link>
        </div>
      </div>
    </div>
  </section>
); 