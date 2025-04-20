import React from 'react';
import { BeakerIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface SandboxHeaderProps {
  onReset: () => void;
  currentUser: {
    name: string;
    email: string;
    role: string;
  };
}

const SandboxHeader: React.FC<SandboxHeaderProps> = ({ onReset, currentUser }) => {
  return (
    <div className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center">
            <BeakerIcon className="h-8 w-8 text-blue-500" />
            <span className="ml-2 text-white font-medium">Sandbox Mode</span>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* User info */}
            <div className="text-sm text-gray-400">
              <span className="font-medium text-white">{currentUser.name}</span>
              <span className="mx-2">•</span>
              <span>{currentUser.email}</span>
              <span className="mx-2">•</span>
              <span className="text-blue-400">{currentUser.role}</span>
            </div>

            {/* Reset button */}
            <button
              onClick={onReset}
              className="inline-flex items-center px-3 py-2 border border-gray-700 rounded-md text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Reset Sandbox
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SandboxHeader; 