import React from 'react';
import Head from 'next/head';

export default function Pricing() {
  return (
    <>
      <Head>
        <title>Pricing – Winston AI</title>
        <meta name="description" content="Simple, transparent pricing for Winston AI" />
      </Head>

      <div className="min-h-screen bg-black">        
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-mono text-white mb-12 text-center">PRICING</h1>
            
            {/* Pricing Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Starter Plan */}
              <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
                <h2 className="text-xl font-mono text-white mb-4 tracking-wider">STARTER</h2>
                <p className="text-3xl font-light text-white mb-6">$99/mo</p>
                <ul className="space-y-4 text-gray-400">
                  <li>500 leads per month</li>
                  <li>Basic email templates</li>
                  <li>Standard support</li>
                </ul>
              </div>

              {/* Pro Plan */}
              <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
                <h2 className="text-xl font-mono text-white mb-4 tracking-wider">PRO</h2>
                <p className="text-3xl font-light text-white mb-6">$299/mo</p>
                <ul className="space-y-4 text-gray-400">
                  <li>2,000 leads per month</li>
                  <li>Advanced email templates</li>
                  <li>Priority support</li>
                </ul>
              </div>

              {/* Business Plan */}
              <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
                <h2 className="text-xl font-mono text-white mb-4 tracking-wider">BUSINESS</h2>
                <p className="text-3xl font-light text-white mb-6">$799/mo</p>
                <ul className="space-y-4 text-gray-400">
                  <li>5,000 leads per month</li>
                  <li>Custom email templates</li>
                  <li>Dedicated support</li>
                </ul>
              </div>

              {/* Enterprise Plan */}
              <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
                <h2 className="text-xl font-mono text-white mb-4 tracking-wider">ENTERPRISE</h2>
                <p className="text-3xl font-light text-white mb-6">CUSTOM</p>
                <ul className="space-y-4 text-gray-400">
                  <li>Unlimited leads</li>
                  <li>Custom integrations</li>
                  <li>24/7 support</li>
                </ul>
              </div>
            </div>

            {/* Chatbot Add-on */}
            <div className="mt-12 bg-gray-900 rounded-lg p-8 border border-gray-800">
              <h2 className="text-xl font-mono text-white mb-4 tracking-wider">CHATBOT ADD-ON</h2>
              <p className="text-3xl font-light text-white mb-6">$49/mo</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-mono text-white tracking-wider">FUNCTIONALITY</h3>
                  <ul className="mt-4 space-y-2 text-gray-400">
                    <li>AI-powered responses</li>
                    <li>24/7 availability</li>
                    <li>Lead qualification</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-mono text-white tracking-wider">ADDITIONAL FEATURES</h3>
                  <ul className="mt-4 space-y-2 text-gray-400">
                    <li>Custom branding</li>
                    <li>Analytics dashboard</li>
                    <li>Integration support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#111111] border-t border-[#222222] z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <p className="text-xs font-mono tracking-widest text-left" style={{ color: 'rgb(50, 205, 50)' }}>
              Powered by Cylon Digital Consulting
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 