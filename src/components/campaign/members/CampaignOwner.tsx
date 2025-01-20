import React from 'react';
import { Shield } from 'lucide-react';

interface CampaignOwnerProps {
  email: string;
}

export function CampaignOwner({ email }: CampaignOwnerProps) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-dark-100 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-gray-400 dark:text-dark-400" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-dark-600">
              Campaign Owner
            </p>
            <p className="text-sm text-gray-500 dark:text-dark-400">
              {email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}