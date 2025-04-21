import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function DemoPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement actual demo request submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Demo request submitted successfully!');
      setLoading(false);
    } catch (error) {
      console.error('Demo request error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="min-h-screen bg-black text-white font-mono">
        <Head>
          <title>Request Demo - Winston AI</title>
          <meta name="description" content="Schedule a demo of Winston AI's automated lead management system" />
        </Head>

        <Navigation />

        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-radial from-gray-900 to-black"></div>

        {/* Main content */}
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md relative z-10">
            {/* System Status Card */}
            <div className="bg-white/10 p-6 mb-8 backdrop-blur-lg">
              <div className="text-center">
                <span className="tracking-wider">SYSTEM STATUS</span>
                <div className="text-4xl font-mono text-[#32CD32] mb-8">
                  READY FOR DEMO
                </div>
                <div className="text-2xl tracking-wider mb-8">REQUEST DEMO</div>
              </div>
            </div>

            {/* Demo Form Card */}
            <div className="bg-white/10 p-8 backdrop-blur-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-2">
                    FULL NAME
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white"
                    placeholder="Enter Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-2">
                    EMAIL ADDRESS
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white"
                    placeholder="Enter Email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-2">
                    COMPANY NAME
                  </label>
                  <input
                    id="company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white"
                    placeholder="Enter Company"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full px-6 py-4 bg-[#32CD32] text-black rounded-lg hover:bg-[#2db82d] transition-colors text-lg
                           ${loading ? 'bg-gray-300 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <span>PROCESSING</span>
                      <span className="animate-pulse">...</span>
                    </span>
                  ) : (
                    'SCHEDULE DEMO'
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10">
                <Link
                  href="/solutions"
                  className="text-center text-gray-400 hover:text-white transition-colors"
                >
                  VIEW SYSTEM FEATURES →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#111111] border-t border-[#222222] z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <p className="text-xs font-mono tracking-widest text-left" style={{ color: 'rgb(50, 205, 50)' }}>
              Powered by Cylon Digital Consulting
            </p>
          </div>
        </div>

        <style jsx="true" global="true">{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap');

          * {
            font-family: 'IBM Plex Mono', monospace;
          }

          .bg-gradient-radial {
            background: radial-gradient(circle at center, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%);
          }
        `}</style>
      </div>
    </div>
  );
} 