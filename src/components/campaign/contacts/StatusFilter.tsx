import React from 'react';
import { Filter } from 'lucide-react';
import { ALL_CONTACT_STATUSES, statusConfig } from '../../../utils/status';
import type { CampaignContact } from '../../../services/contacts/types';

interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
  contacts: CampaignContact[];
}

export function StatusFilter({ value, onChange, contacts }: StatusFilterProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-10 pr-8 py-2 rounded-lg border border-gray-300 dark:border-dark-300 bg-white dark:bg-dark-50 text-gray-900 dark:text-dark-600"
      >
        <option value="all">All Statuses</option>
        {ALL_CONTACT_STATUSES.map(status => (
          <option key={status} value={status}>
            {statusConfig[status].label}
          </option>
        ))}
      </select>
      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    </div>
  );
}