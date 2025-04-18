import React from 'react';
import Head from 'next/head';
import Navigation from '@/components/Navigation';
import ExpandableDocs from '../components/ExpandableDocs';

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <Head>
        <title>Solutions - Winston AI</title>
        <meta name="description" content="Discover Winston AI's powerful solutions for automated lead management" />
      </Head>

      <Navigation />

      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-light mb-8">System Solutions</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Lead Generation */}
            <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
              <h2 className="text-xl font-light mb-4">Lead Generation</h2>
              <p className="text-gray-400 mb-4">
                Automated lead sourcing and verification using advanced AI algorithms.
              </p>
              <div className="text-[#32CD32]">Active</div>
            </div>

            {/* Email Automation */}
            <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
              <h2 className="text-xl font-light mb-4">Email Automation</h2>
              <p className="text-gray-400 mb-4">
                Smart email sequences with personalized content and optimal timing.
              </p>
              <div className="text-[#32CD32]">Active</div>
            </div>

            {/* Response Analysis */}
            <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
              <h2 className="text-xl font-light mb-4">Response Analysis</h2>
              <p className="text-gray-400 mb-4">
                AI-powered response analysis and sentiment detection.
              </p>
              <div className="text-[#32CD32]">Active</div>
            </div>

            {/* Meeting Scheduling */}
            <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
              <h2 className="text-xl font-light mb-4">Meeting Scheduling</h2>
              <p className="text-gray-400 mb-4">
                Automated demo and meeting scheduling with calendar integration.
              </p>
              <div className="text-[#32CD32]">Active</div>
            </div>
          </div>

          <ExpandableDocs />
        </div>
      </main>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#111111] border-t border-[#222222] z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-sm font-mono tracking-widest" style={{ color: 'rgb(50, 205, 50)' }}>
            Powered by Cylon Digital
          </p>
        </div>
      </div>
    </div>
  );
} 