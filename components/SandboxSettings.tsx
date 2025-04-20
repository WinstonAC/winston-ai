import React, { useState } from 'react';
import { 
  Cog6ToothIcon, 
  EnvelopeIcon, 
  ChartBarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface SandboxSettingsProps {
  onUpdate: (settings: {
    emailRate: number;
    openRate: number;
    clickRate: number;
    responseRate: number;
  }) => void;
}

const SandboxSettings: React.FC<SandboxSettingsProps> = ({ onUpdate }) => {
  const [settings, setSettings] = useState({
    emailRate: 50,
    openRate: 30,
    clickRate: 15,
    responseRate: 10
  });

  const handleChange = (key: keyof typeof settings, value: number) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onUpdate(newSettings);
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <div className="flex items-center mb-6">
        <Cog6ToothIcon className="h-6 w-6 text-gray-400 mr-2" />
        <h3 className="text-lg font-medium text-white">Sandbox Settings</h3>
      </div>

      <div className="space-y-6">
        {/* Email Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-300">Email Rate</span>
            </div>
            <span className="text-gray-400">{settings.emailRate}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.emailRate}
            onChange={(e) => handleChange('emailRate', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Open Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <ChartBarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-300">Open Rate</span>
            </div>
            <span className="text-gray-400">{settings.openRate}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.openRate}
            onChange={(e) => handleChange('openRate', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Click Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <ChartBarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-300">Click Rate</span>
            </div>
            <span className="text-gray-400">{settings.clickRate}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.clickRate}
            onChange={(e) => handleChange('clickRate', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Response Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-300">Response Rate</span>
            </div>
            <span className="text-gray-400">{settings.responseRate}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.responseRate}
            onChange={(e) => handleChange('responseRate', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-400">
        <p>These settings control the behavior of the sandbox environment:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Email Rate: Percentage of leads that receive emails</li>
          <li>Open Rate: Percentage of emails that get opened</li>
          <li>Click Rate: Percentage of emails that get clicked</li>
          <li>Response Rate: Percentage of leads that respond</li>
        </ul>
      </div>
    </div>
  );
};

export default SandboxSettings; 