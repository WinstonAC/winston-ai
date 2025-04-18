import React from 'react';
import Head from 'next/head';
import Navigation from '@/components/Navigation';

export default function LeadsPage() {
  return (
    <div className="min-h-screen bg-black">
      <Head>
        <title>Leads - Winston AI</title>
        <meta name="description" content="Manage your leads" />
      </Head>

      <Navigation />

      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-light text-white mb-8">Leads</h1>
          
          {/* Placeholder content */}
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
            <p className="text-gray-400">Leads management coming soon...</p>
          </div>
        </div>
      </main>
    </div>
  );
} 