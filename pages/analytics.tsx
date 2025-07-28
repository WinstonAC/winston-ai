import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChartBarIcon, ArrowsRightLeftIcon, DocumentArrowDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Navigation from '@/components/Navigation';
import Head from 'next/head';

const Analytics = () => {
  const { user } = useAuth();

  return (
    <>
      <Head>
        <title>Analytics - Winston AI</title>
        <meta name="description" content="Campaign analytics and performance metrics" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Navigation />

      <div className="min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-mono font-bold mb-4 text-[#32CD32]">Campaign Analytics</h1>
            <p className="text-gray-400 font-mono">Real-time performance metrics and insights</p>
          </div>

                     {/* Quick Actions */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
             <button 
               onClick={() => alert('Chart visualization would open here')}
               className="bg-black border-2 border-[#32CD32] p-6 text-[#32CD32] hover:bg-[#32CD32] hover:text-black transition-colors flex flex-col items-center"
             >
               <ChartBarIcon className="h-8 w-8 mb-2" />
               <span className="font-mono font-bold">View Charts</span>
             </button>
             <button 
               onClick={() => alert('Campaign comparison tool would open here')}
               className="bg-black border-2 border-[#32CD32] p-6 text-[#32CD32] hover:bg-[#32CD32] hover:text-black transition-colors flex flex-col items-center"
             >
               <ArrowsRightLeftIcon className="h-8 w-8 mb-2" />
               <span className="font-mono font-bold">Compare Campaign</span>
             </button>
             <button 
               onClick={() => {
                 const csvData = "Campaign,Sent,Opened,Clicked,Replied\nDemo Campaign,1234,856,432,89";
                 const blob = new Blob([csvData], { type: 'text/csv' });
                 const url = window.URL.createObjectURL(blob);
                 const a = document.createElement('a');
                 a.href = url;
                 a.download = 'analytics-data.csv';
                 a.click();
               }}
               className="bg-black border-2 border-[#32CD32] p-6 text-[#32CD32] hover:bg-[#32CD32] hover:text-black transition-colors flex flex-col items-center"
             >
               <DocumentArrowDownIcon className="h-8 w-8 mb-2" />
               <span className="font-mono font-bold">Export Data</span>
             </button>
             <button 
               onClick={() => window.location.reload()}
               className="bg-black border-2 border-[#32CD32] p-6 text-[#32CD32] hover:bg-[#32CD32] hover:text-black transition-colors flex flex-col items-center"
             >
               <ArrowPathIcon className="h-8 w-8 mb-2" />
               <span className="font-mono font-bold">Refresh</span>
             </button>
           </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-black border-2 border-[#32CD32] p-6 text-center">
              <h3 className="font-mono text-lg mb-6 text-[#32CD32]">Campaign Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono">Sent</span>
                  <span className="text-[#32CD32] font-mono">1,234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono">Delivered</span>
                  <span className="text-[#32CD32] font-mono">1,200</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono">Opened</span>
                  <span className="text-[#32CD32] font-mono">856</span>
                </div>
              </div>
            </div>

            <div className="bg-black border-2 border-[#32CD32] p-6 text-center">
              <h3 className="font-mono text-lg mb-6 text-[#32CD32]">Engagement Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono">Clicked</span>
                  <span className="text-[#32CD32] font-mono">432</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono">Replies</span>
                  <span className="text-[#32CD32] font-mono">89</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono">Meetings</span>
                  <span className="text-[#32CD32] font-mono">24</span>
                </div>
              </div>
            </div>

            <div className="bg-black border-2 border-[#32CD32] p-6 text-center">
              <h3 className="font-mono text-lg mb-6 text-[#32CD32]">Conversion Rates</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono">Open Rate</span>
                  <span className="text-[#32CD32] font-mono">71.3%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono">Click Rate</span>
                  <span className="text-[#32CD32] font-mono">36.0%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono">Meeting Rate</span>
                  <span className="text-[#32CD32] font-mono">2.0%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="bg-black border-2 border-[#32CD32] p-8 mb-8 text-center">
            <h3 className="font-mono text-lg mb-6 text-[#32CD32]">Performance Over Time</h3>
            <div className="h-64 flex items-center justify-center">
              <span className="text-[#32CD32] font-mono">Chart Visualization Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Analytics; 