import React from 'react';
import Head from 'next/head';
import Navigation from '@/components/Navigation';

export default function Pricing() {
  return (
    <>
      <Head>
        <title>Pricing – Winston AI</title>
        <meta name="description" content="Simple, transparent pricing for Winston AI" />
      </Head>

      <div className="min-h-screen bg-black">
        <Navigation />
        
        <main className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-mono text-white mb-12 text-center">PRICING_</h1>
            
            {/* Pricing Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Starter Plan */}
              <div className="bg-gray-900 rounded-lg p-8 border border-gray-800 hover:border-gray-700 transition-colors">
                <h2 className="text-xl font-mono text-white mb-4 tracking-wider">STARTER_</h2>
                <p className="text-3xl font-light text-white mb-6">$29<span className="text-gray-200 text-lg">/mo</span></p>
                <ul className="space-y-4 text-gray-200">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>CSV upload & preview</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Basic email automation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>GPT-powered reply classification</span>
                  </li>
                </ul>
              </div>

              {/* Pro Plan */}
              <div className="bg-gray-900 rounded-lg p-8 border border-gray-800 hover:border-gray-700 transition-colors">
                <h2 className="text-xl font-mono text-white mb-4 tracking-wider">PRO_</h2>
                <p className="text-3xl font-light text-white mb-6">$99<span className="text-gray-200 text-lg">/mo</span></p>
                <ul className="space-y-4 text-gray-200">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Everything in Starter</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Automatic demo-link emails</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Delivery analytics & storage</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>

              {/* Business Plan */}
              <div className="bg-gray-900 rounded-lg p-8 border border-gray-800 hover:border-gray-700 transition-colors">
                <h2 className="text-xl font-mono text-white mb-4 tracking-wider">BUSINESS_</h2>
                <p className="text-3xl font-light text-white mb-6">$199<span className="text-gray-200 text-lg">/mo</span></p>
                <ul className="space-y-4 text-gray-200">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Everything in Pro</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>On-site Chatbot module</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Lead qualification & onboarding</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Custom templates & branding</span>
                  </li>
                </ul>
              </div>

              {/* Enterprise Plan */}
              <div className="bg-gray-900 rounded-lg p-8 border border-gray-800 hover:border-gray-700 transition-colors">
                <h2 className="text-xl font-mono text-white mb-4 tracking-wider">ENTERPRISE_</h2>
                <p className="text-3xl font-light text-white mb-6">CUSTOM_</p>
                <ul className="space-y-4 text-gray-200">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Everything in Business</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Dedicated account manager</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>SLA & advanced integrations</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Chatbot Add-On */}
            <div className="mt-16 bg-gray-900 rounded-lg p-8 border border-gray-800 hover:border-gray-700 transition-colors">
              <h2 className="text-xl font-mono text-white mb-4 tracking-wider">CHATBOT_ADD-ON_</h2>
              <p className="text-3xl font-light text-white mb-6">+$49<span className="text-gray-200 text-lg">/mo</span></p>
              <p className="text-gray-200 mb-8">Live-chat assistant for qualification & support</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-mono text-white tracking-wider">FUNCTIONALITY_</h3>
                  <ul className="space-y-4 text-gray-200">
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      <span>Lead Qualification</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      <span>User Onboarding</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      <span>Quick Support</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      <span>Demo Scheduling</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-mono text-white tracking-wider">ADDITIONAL_FEATURES_</h3>
                  <ul className="space-y-4 text-gray-200">
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      <span>Feedback Collection</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      <span>Contextual Tips</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      <span>API/Doc Assistance</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <p className="text-sm font-mono text-green-400 tracking-widest">
              POWERED_BY_CYLON_DIGITAL
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 