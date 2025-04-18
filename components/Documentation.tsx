import React, { useState } from 'react';
import Link from 'next/link';

const Documentation: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');

  const sections = [
    { id: 'overview', title: 'OVERVIEW_' },
    { id: 'features', title: 'FEATURES_' },
    { id: 'examples', title: 'USAGE_EXAMPLES_' },
    { id: 'navigation', title: 'NAVIGATION_' },
    { id: 'technical', title: 'TECHNICAL_DETAILS_' }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-[#32CD32] hover:underline font-mono tracking-wider">
            BACK_TO_HOME_
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="sticky top-8">
              <h1 className="text-2xl font-mono tracking-wider mb-6">CHATBOT_DOCS_</h1>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;

const OverviewSection: React.FC = () => (
  <section className="space-y-6">
    <h2 className="text-3xl font-mono tracking-wider mb-6">OVERVIEW_</h2>
    <div className="bg-gray-900 p-8 rounded-lg">
      <p className="text-gray-300 mb-6 leading-relaxed">
        The Winston AI chatbot is a context-aware assistant that helps users navigate and interact with the application. It provides real-time information and can navigate between different sections of the application.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-[#32CD32] font-mono tracking-wider mb-2">PURPOSE_</h3>
          <p className="text-gray-300">Help users navigate and interact with Winston AI efficiently</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-[#32CD32] font-mono tracking-wider mb-2">LOCATION_</h3>
          <p className="text-gray-300">Accessible from any page in the bottom-right corner</p>
        </div>
      </div>
    </div>
  </section>
);

const FeaturesSection: React.FC = () => (
  <section className="space-y-6">
    <h2 className="text-3xl font-mono tracking-wider mb-6">FEATURES_</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FeatureCard
        title="CONTEXT_AWARENESS_"
        description="The chatbot understands which page you're on and provides relevant information and commands."
        icon="🔄"
      />
      <FeatureCard
        title="NAVIGATION_"
        description="Click on topics to navigate between pages or get specific information about features."
        icon="📍"
      />
      <FeatureCard
        title="REAL_TIME_INTERACTION_"
        description="Get instant responses to your queries with a typing animation for a natural feel."
        icon="⚡"
      />
      <FeatureCard
        title="BRUTALIST_DESIGN_"
        description="Consistent with the application's aesthetic, featuring monospace font and lime green accents."
        icon="🎨"
      />
    </div>
  </section>
);

const FeatureCard: React.FC<{ title: string; description: string; icon: string }> = ({
  title,
  description,
  icon
}) => (
  <div className="bg-gray-900 p-6 rounded-lg hover:bg-gray-800 transition-colors">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-mono tracking-wider mb-2 text-[#32CD32]">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </div>
);

const ExamplesSection: React.FC = () => (
  <section className="space-y-6">
    <h2 className="text-3xl font-mono tracking-wider mb-6">USAGE_EXAMPLES_</h2>
    <div className="space-y-8">
      <ExampleCard
        title="DASHBOARD_INTERACTION_"
        userInput="VIEW_YOUR_LEAD_STATS_"
        botResponses={[
          'CURRENT_METRICS_',
          'LEADS_123_',
          'ACTIVE_CAMPAIGNS_5_',
          'CONVERSION_RATE_12%_'
        ]}
      />
      <ExampleCard
        title="LEADS_MANAGEMENT_"
        userInput="CLASSIFY_LEADS_"
        botResponses={[
          'LEAD_CLASSIFICATION_',
          'USE_THE_CLASSIFICATION_TOOL_',
          'TO_TAG_AND_CATEGORIZE_LEADS_'
        ]}
      />
      <ExampleCard
        title="CAMPAIGN_CONTROL_"
        userInput="CREATE_NEW_CAMPAIGN_"
        botResponses={[
          'NEW_CAMPAIGN_SETUP_',
          '1_SELECT_CAMPAIGN_TYPE_',
          '2_DEFINE_TARGET_AUDIENCE_',
          '3_SET_OBJECTIVES_'
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
      <p className="text-gray-400">USER: {userInput}</p>
      {botResponses.map((response, index) => (
        <p key={index} className="text-[#32CD32]">{response}</p>
      ))}
    </div>
  </div>
);

const NavigationSection: React.FC = () => (
  <section className="space-y-6">
    <h2 className="text-3xl font-mono tracking-wider mb-6">NAVIGATION_</h2>
    <div className="bg-gray-900 p-6 rounded-lg">
      <p className="text-gray-300 mb-6">
        The chatbot can help you navigate between different sections of the application. Available navigation options depend on your current page:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-[#32CD32] font-mono tracking-wider mb-2">FROM_DASHBOARD_</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• MANAGE_YOUR_CAMPAIGNS_ → /campaigns</li>
            <li>• UPLOAD_NEW_LEADS_ → /leads</li>
          </ul>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-[#32CD32] font-mono tracking-wider mb-2">FROM_LEADS_OR_CAMPAIGNS_</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• GO_TO_DASHBOARD_ → /dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
);

const TechnicalSection: React.FC = () => (
  <section className="space-y-6">
    <h2 className="text-3xl font-mono tracking-wider mb-6">TECHNICAL_DETAILS_</h2>
    <div className="bg-gray-900 p-6 rounded-lg">
      <h3 className="text-xl font-mono tracking-wider mb-4 text-[#32CD32]">IMPLEMENTATION_</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="font-mono tracking-wider mb-2 text-[#32CD32]">TECHNOLOGIES_</h4>
          <ul className="space-y-2 text-gray-300">
            <li>• React Hooks</li>
            <li>• Next.js Router</li>
            <li>• Tailwind CSS</li>
            <li>• TypeScript</li>
          </ul>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="font-mono tracking-wider mb-2 text-[#32CD32]">FEATURES_</h4>
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