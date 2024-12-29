import React, { useState } from 'react';
import { ChevronDown, ChevronRight, LucideIcon, AlertCircle } from 'lucide-react';
import type { ImportContact, ImportError } from '../../types/import';

interface ImportSummarySectionProps {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  count: number;
  contacts?: ImportContact[];
  errors?: ImportError[];
}

export function ImportSummarySection({ 
  icon: Icon, 
  iconColor, 
  title, 
  count, 
  contacts = [],
  errors = []
}: ImportSummarySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasContent = contacts.length > 0 || errors.length > 0;

  return (
    <div className="bg-gray-50 dark:bg-dark-100 rounded-lg overflow-hidden">
      <button
        onClick={() => hasContent && setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-4 ${hasContent ? 'cursor-pointer hover:bg-gray-300 dark:hover:bg-dark-400' : ''}`}
      >
        <div className="flex items-center">
          <Icon className={`w-5 h-5 ${iconColor} mr-2`} />
          <span className="text-gray-700 dark:text-dark-600">{title}</span>
        </div>
        <div className="flex items-center">
          <span className="font-semibold text-gray-900 dark:text-dark-600 mr-2">
            {count}
          </span>
          {hasContent && (
            isExpanded ? 
              <ChevronDown className="w-4 h-4 text-gray-500" /> : 
              <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-dark-200">
          <div className="max-h-40 overflow-y-auto">
            {contacts.map((contact, index) => (
              <div 
                key={index}
                className="px-4 py-2 flex justify-between items-center text-sm border-b border-gray-100 dark:border-dark-300 last:border-0"
              >
                <span className="text-gray-700 dark:text-dark-600">
                  {`${contact.first_name} ${contact.last_name}`.trim()}
                </span>
                <span className="text-gray-500 dark:text-dark-400">
                  {contact.phone_number}
                </span>
              </div>
            ))}
            {errors.map((error, index) => (
              <div 
                key={index}
                className="px-4 py-2 text-sm border-b border-gray-100 dark:border-dark-300 last:border-0"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-gray-700 dark:text-dark-600">
                    {error.data.name || '<empty>'}
                  </span>
                  <span className="text-gray-500 dark:text-dark-400">
                    {error.data.phone || '<empty>'}
                  </span>
                </div>
                <div className="flex items-center text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="text-xs">Row {error.rowNumber}: {error.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}