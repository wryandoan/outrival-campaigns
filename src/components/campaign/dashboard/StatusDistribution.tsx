import React from 'react';
import { useStatusDistribution } from '../../../hooks/useStatusDistribution';
import { Loader2 } from 'lucide-react';
import { statusConfig } from '../../../utils/status';

interface StatusDistributionProps {
  campaignId: string;
}

export function StatusDistribution({ campaignId }: StatusDistributionProps) {
  const { distribution, loading, error } = useStatusDistribution(campaignId);

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 dark:text-red-400 p-4">
        Failed to load status distribution
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-50 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-600 mb-4">
        Status Distribution
      </h3>
      
      <div className="space-y-4">
        {Object.entries(distribution).map(([status, count]) => {
          const config = statusConfig[status as keyof typeof statusConfig];
          return (
            <div key={status} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-dark-600">
                    {config?.label || status}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-dark-400">
                    {count}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-dark-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${config?.color || 'bg-gray-500'}`}
                    style={{ width: `${(count / Object.values(distribution).reduce((a, b) => a + b, 0)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}