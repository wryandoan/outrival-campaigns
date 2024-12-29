import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { Campaign } from '../../types';

interface PersonalizationTabProps {
  campaign: Campaign;
}

export function PersonalizationTab({ campaign }: PersonalizationTabProps) {
  // Get unique personalization fields from all campaign contacts
  const uniqueFields = new Set<string>();
  const contacts = campaign.contacts || [];
  contacts.forEach(contact => {
    if (contact.personalization_fields) {
      Object.keys(contact.personalization_fields).forEach(key => uniqueFields.add(key));
    }
  });

  const fields = Array.from(uniqueFields);

  if (fields.length === 0) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-8 h-8 text-gray-400 dark:text-dark-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-dark-600 mb-2">
          No Personalization Fields
        </h3>
        <p className="text-sm text-gray-500 dark:text-dark-400">
          Add personalization fields when importing contacts to use them in your scripts.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-50 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-600 mb-4">
        Available Personalization Fields
      </h3>
      
      <div className="space-y-4">
        {fields.map((field) => (
          <div 
            key={field}
            className="p-4 bg-gray-50 dark:bg-dark-100 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-dark-600">
                  {field}
                </h4>
                <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">
                  Use <code className="px-1 py-0.5 bg-gray-100 dark:bg-dark-200 rounded">{'{{' + field + '}}'}</code> in your scripts
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}