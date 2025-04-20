import React from 'react';
import { useSession } from 'next-auth/react';
import { ChartBarIcon, ArrowsRightLeftIcon, DocumentArrowDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const Analytics = () => {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-mono font-bold mb-4">CAMPAIGN_ANALYTICS_</h1>
          <p className="text-[#32CD32] font-mono">REAL_TIME_PERFORMANCE_METRICS_AND_INSIGHTS_</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <button className="bg-black border-2 border-[#32CD32] p-4 text-[#32CD32] hover:bg-[#32CD32] hover:text-black transition-colors">
            <ChartBarIcon className="h-6 w-6 mb-2 mx-auto" />
            <span className="font-mono">VIEW_CHARTS_</span>
          </button>
          <button className="bg-black border-2 border-[#32CD32] p-4 text-[#32CD32] hover:bg-[#32CD32] hover:text-black transition-colors">
            <ArrowsRightLeftIcon className="h-6 w-6 mb-2 mx-auto" />
            <span className="font-mono">COMPARE_CAMPAIGNS_</span>
          </button>
          <button className="bg-black border-2 border-[#32CD32] p-4 text-[#32CD32] hover:bg-[#32CD32] hover:text-black transition-colors">
            <DocumentArrowDownIcon className="h-6 w-6 mb-2 mx-auto" />
            <span className="font-mono">EXPORT_DATA_</span>
          </button>
          <button className="bg-black border-2 border-[#32CD32] p-4 text-[#32CD32] hover:bg-[#32CD32] hover:text-black transition-colors">
            <ArrowPathIcon className="h-6 w-6 mb-2 mx-auto" />
            <span className="font-mono">REFRESH_</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black border-2 border-[#32CD32] p-6">
            <h3 className="font-mono text-lg mb-4">CAMPAIGN_PERFORMANCE_</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-mono">SENT_</span>
                <span className="text-[#32CD32] font-mono">1,234</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-mono">DELIVERED_</span>
                <span className="text-[#32CD32] font-mono">1,200</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-mono">OPENED_</span>
                <span className="text-[#32CD32] font-mono">856</span>
              </div>
            </div>
          </div>

          <div className="bg-black border-2 border-[#32CD32] p-6">
            <h3 className="font-mono text-lg mb-4">ENGAGEMENT_METRICS_</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-mono">CLICKED_</span>
                <span className="text-[#32CD32] font-mono">432</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-mono">REPLIES_</span>
                <span className="text-[#32CD32] font-mono">89</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-mono">MEETINGS_</span>
                <span className="text-[#32CD32] font-mono">24</span>
              </div>
            </div>
          </div>

          <div className="bg-black border-2 border-[#32CD32] p-6">
            <h3 className="font-mono text-lg mb-4">CONVERSION_RATES_</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-mono">OPEN_RATE_</span>
                <span className="text-[#32CD32] font-mono">71.3%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-mono">CLICK_RATE_</span>
                <span className="text-[#32CD32] font-mono">36.0%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-mono">MEETING_RATE_</span>
                <span className="text-[#32CD32] font-mono">2.0%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="bg-black border-2 border-[#32CD32] p-6 mb-8">
          <h3 className="font-mono text-lg mb-4">PERFORMANCE_OVER_TIME_</h3>
          <div className="h-64 flex items-center justify-center">
            <span className="text-[#32CD32] font-mono">CHART_VISUALIZATION_HERE_</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 