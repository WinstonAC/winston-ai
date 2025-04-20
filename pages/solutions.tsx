import React from 'react';
import Head from 'next/head';
import Navigation from '@/components/Navigation';
import ExpandableDocs from '../components/ExpandableDocs';

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <Head>
        <title>Solutions - Winston AI</title>
        <meta name="description" content="Discover Winston AI's powerful solutions for automated lead management and analytics" />
      </Head>

      <Navigation />

      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-light mb-12">SYSTEM SOLUTIONS</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Lead Generation */}
            <div className="bg-gray-900 rounded-lg p-8 border-2 border-white">
              <h2 className="text-2xl font-light mb-4">LEAD GENERATION</h2>
              <p className="text-gray-400 mb-6 text-lg">
                AUTOMATED_LEAD_SOURCING_AND_VERIFICATION_USING_ADVANCED_AI_ALGORITHMS_
              </p>
              <div className="text-[#32CD32] text-sm font-bold tracking-wider">ACTIVE</div>
            </div>

            {/* Email Automation */}
            <div className="bg-gray-900 rounded-lg p-8 border-2 border-white">
              <h2 className="text-2xl font-light mb-4">EMAIL AUTOMATION</h2>
              <p className="text-gray-400 mb-6 text-lg">
                SMART_EMAIL_SEQUENCES_WITH_PERSONALIZED_CONTENT_AND_OPTIMAL_TIMING_
              </p>
              <div className="text-[#32CD32] text-sm font-bold tracking-wider">ACTIVE</div>
            </div>

            {/* Unified Chatbot */}
            <div className="bg-gray-900 rounded-lg p-8 border-2 border-white">
              <h2 className="text-2xl font-light mb-4">UNIFIED CHATBOT</h2>
              <p className="text-gray-400 mb-6 text-lg">
                CONTEXT-AWARE_ASSISTANCE_FOR_BOTH_GENERAL_AND_ANALYTICS_QUERIES_
              </p>
              <ul className="text-gray-400 mb-6 text-sm space-y-2">
                <li>• GENERAL_MODE_FOR_LEAD_AND_CAMPAIGN_MANAGEMENT_</li>
                <li>• ANALYTICS_MODE_FOR_DATA_ANALYSIS_AND_INSIGHTS_</li>
                <li>• BRUTALIST_DESIGN_WITH_HIGH_CONTRAST_AND_MONOSPACE_TYPOGRAPHY_</li>
              </ul>
              <div className="text-[#32CD32] text-sm font-bold tracking-wider">ACTIVE</div>
            </div>

            {/* Analytics Dashboard */}
            <div className="bg-gray-900 rounded-lg p-8 border-2 border-white">
              <h2 className="text-2xl font-light mb-4">ANALYTICS DASHBOARD</h2>
              <p className="text-gray-400 mb-6 text-lg">
                REAL-TIME_METRICS_AND_CAMPAIGN_PERFORMANCE_ANALYSIS_
              </p>
              <ul className="text-gray-400 mb-6 text-sm space-y-2">
                <li>• INTERACTIVE_CHARTS_AND_VISUALIZATIONS_</li>
                <li>• CAMPAIGN_COMPARISON_TOOLS_</li>
                <li>• CUSTOM_REPORT_GENERATION_</li>
                <li>• REAL-TIME_DATA_UPDATES_</li>
              </ul>
              <div className="text-[#32CD32] text-sm font-bold tracking-wider">ACTIVE</div>
            </div>

            {/* Response Analysis */}
            <div className="bg-gray-900 rounded-lg p-8 border-2 border-white">
              <h2 className="text-2xl font-light mb-4">RESPONSE ANALYSIS</h2>
              <p className="text-gray-400 mb-6 text-lg">
                AI-POWERED_RESPONSE_ANALYSIS_AND_SENTIMENT_DETECTION_
              </p>
              <div className="text-[#32CD32] text-sm font-bold tracking-wider">ACTIVE</div>
            </div>

            {/* Meeting Scheduling */}
            <div className="bg-gray-900 rounded-lg p-8 border-2 border-white">
              <h2 className="text-2xl font-light mb-4">MEETING SCHEDULING</h2>
              <p className="text-gray-400 mb-6 text-lg">
                AUTOMATED_DEMO_AND_MEETING_SCHEDULING_WITH_CALENDAR_INTEGRATION_
              </p>
              <div className="text-[#32CD32] text-sm font-bold tracking-wider">ACTIVE</div>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-light mb-8">INTEGRATED_WORKFLOW</h2>
            <div className="bg-gray-900 rounded-lg p-8 border-2 border-white">
              <p className="text-gray-400 mb-6 text-lg">
                ALL_SOLUTIONS_WORK_SEAMLESSLY_TOGETHER_TO_PROVIDE_A_COMPLETE_SALES_AUTOMATION_PLATFORM_
              </p>
              <ul className="text-gray-400 mb-6 text-sm space-y-2">
                <li>• UNIFIED_CHATBOT_PROVIDES_CONTEXT-AWARE_ASSISTANCE_ACROSS_ALL_FEATURES_</li>
                <li>• ANALYTICS_DASHBOARD_TRACKS_PERFORMANCE_AND_PROVIDES_ACTIONABLE_INSIGHTS_</li>
                <li>• REAL-TIME_UPDATES_AND_NOTIFICATIONS_KEEP_YOU_INFORMED_</li>
                <li>• SECURE_AND_SCALABLE_INFRASTRUCTURE_FOR_ENTERPRISE_USE_</li>
              </ul>
            </div>
          </div>

          <ExpandableDocs />
        </div>
      </main>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#111111] border-t-2 border-white z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-sm font-mono tracking-wider" style={{ color: 'rgb(50, 205, 50)' }}>
            POWERED_BY_CYLON_DIGITAL_
          </p>
        </div>
      </div>
    </div>
  );
} 