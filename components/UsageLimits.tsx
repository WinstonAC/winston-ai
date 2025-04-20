import React from 'react';
import { usePermissions } from '../contexts/PermissionsContext';
import { ChartBarIcon, DocumentDuplicateIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

export const UsageLimits: React.FC = () => {
  const { state, checkUsageLimit } = usePermissions();

  if (!state.permissions) return null;

  const { usageLimits } = state.permissions;

  const limits = [
    {
      icon: DocumentDuplicateIcon,
      label: 'Monthly Exports',
      value: usageLimits.maxExportsPerMonth,
      used: 0, // This would come from your actual usage tracking
    },
    {
      icon: ChartBarIcon,
      label: 'Campaign Comparisons',
      value: usageLimits.maxCampaignsToCompare,
      used: 0,
    },
    {
      icon: DocumentDuplicateIcon,
      label: 'Custom Reports',
      value: usageLimits.maxCustomReports,
      used: 0,
    },
    {
      icon: CalendarIcon,
      label: 'Scheduled Exports',
      value: usageLimits.maxScheduledExports,
      used: 0,
    },
    {
      icon: ClockIcon,
      label: 'Data Retention (days)',
      value: usageLimits.dataRetentionPeriod,
      used: 0,
    },
  ];

  return (
    <div className="p-4 border-2 border-black bg-white">
      <h3 className="text-lg font-bold mb-4">Usage Limits</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {limits.map((limit) => {
          const Icon = limit.icon;
          const percentage = (limit.used / limit.value) * 100;
          const isNearLimit = percentage > 80;
          const isOverLimit = percentage >= 100;

          return (
            <div
              key={limit.label}
              className={`p-4 border-2 border-black ${
                isOverLimit ? 'bg-red-100' : isNearLimit ? 'bg-yellow-100' : 'bg-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-5 h-5" />
                <span className="font-medium">{limit.label}</span>
              </div>
              <div className="w-full bg-gray-200 h-2 mb-1">
                <div
                  className={`h-full ${
                    isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-black'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <div className="text-sm">
                {limit.used} / {limit.value} used
              </div>
              {isNearLimit && !isOverLimit && (
                <div className="text-sm text-yellow-600 mt-1">Approaching limit</div>
              )}
              {isOverLimit && (
                <div className="text-sm text-red-600 mt-1">Limit reached</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}; 