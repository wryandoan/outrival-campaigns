import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { FieldMapping } from '../../types/import';

interface FieldMapperProps {
  csvHeaders: string[];
  mapping: FieldMapping;
  onUpdateMapping: (field: keyof FieldMapping, value: string) => void;
}

export function FieldMapper({ csvHeaders, mapping, onUpdateMapping }: FieldMapperProps) {
  const requiredFields = [
    { key: 'firstName' as const, label: 'First Name' },
    { key: 'lastName' as const, label: 'Last Name' },
    { key: 'phoneNumber' as const, label: 'Phone Number' }
  ];

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-900 dark:text-dark-600">
        The left side is the values we need, the right side allows you to select what names you chose for those values.
      </div>
      
      <div className="space-y-3">
        {requiredFields.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-4">
            <label className="w-32 text-sm font-medium text-gray-700 dark:text-dark-400">
              {label} *
            </label>
            <div className="relative flex-1">
              <select
                value={mapping[key] || ''}
                onChange={(e) => onUpdateMapping(key, e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-300 dark:border-dark-300 bg-white dark:bg-dark-50 px-4 py-2 text-gray-900 dark:text-dark-600 shadow-sm focus:border-dark-300 dark:focus:border-dark-200 focus:outline-none"
              >
                <option value="">Select a field</option>
                {csvHeaders.map((header) => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500 dark:text-dark-400 mt-4">
        * Required fields
      </p>
    </div>
  );
}