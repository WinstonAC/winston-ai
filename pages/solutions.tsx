import React from 'react';
import Head from 'next/head';
import ExpandableDocs from '@/components/ExpandableDocs';

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <Head>
        <title>Solutions - Winston AI</title>
        <meta name="description" content="Discover Winston AI's powerful solutions for automated lead management and analytics" />
      </Head>

      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Solutions
            </h1>
            <p className="text-xl text-gray-400">
              Discover how Winston AI can transform your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-900 rounded-lg shadow-lg p-6 border-2 border-white">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Lead Generation
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span className="text-gray-400">Automated lead discovery and qualification</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span className="text-gray-400">AI-powered lead scoring and prioritization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span className="text-gray-400">Real-time lead tracking and analytics</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-900 rounded-lg shadow-lg p-6 border-2 border-white">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Campaign Management
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span className="text-gray-400">Multi-channel campaign orchestration</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span className="text-gray-400">Personalized messaging at scale</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span className="text-gray-400">Automated follow-up sequences</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-900 rounded-lg shadow-lg p-6 border-2 border-white">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Analytics & Reporting
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span className="text-gray-400">Comprehensive campaign analytics</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span className="text-gray-400">Customizable reporting dashboards</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span className="text-gray-400">ROI tracking and optimization</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-light text-white mb-8">Integrated Workflow</h2>
            <div className="bg-gray-900 rounded-lg p-8 border-2 border-white">
              <p className="text-gray-400 mb-6 text-lg">
                All solutions work seamlessly together to provide a complete sales automation platform
              </p>
              <ul className="text-gray-400 mb-6 text-sm space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Unified chatbot provides context-aware assistance across all features</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Analytics dashboard tracks performance and provides actionable insights</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Real-time updates and notifications keep you informed</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Secure and scalable infrastructure for enterprise use</span>
                </li>
              </ul>
            </div>
          </div>

          <ExpandableDocs />
        </div>
      </main>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#111111] border-t-2 border-white z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-sm font-mono tracking-wider text-green-500">
            Powered by Winston AI
          </p>
        </div>
      </div>
    </div>
  );
} 