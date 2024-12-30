import React from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';
import type { PersonalizationField } from '../../types/import';

interface PersonalizationFieldsProps {
  csvHeaders: string[];
  fields: PersonalizationField[];
  onAddField: () => void;
  onRemoveField: (index: number) => void;
  onUpdateField: (index: number, updates: Partial<PersonalizationField>) => void;
}

export function PersonalizationFields({
  csvHeaders,
  fields,
  onAddField,
  onRemoveField,
  onUpdateField
}: PersonalizationFieldsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-dark-400">
        Personalization Fields (Optional)
      </h3>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="flex-1 space-y-2">
              <div className="relative">
                <select
                  value={field.csvHeader || ''}
                  onChange={(e) => onUpdateField(index, { csvHeader: e.target.value })}
                  className="w-full appearance-none rounded-lg border border-gray-300 dark:border-dark-300 bg-white dark:bg-dark-50 px-4 py-2 text-gray-900 dark:text-dark-600"
                >
                  <option value="">Select CSV column</option>
                  {csvHeaders.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <input
                type="text"
                value={field.key}
                onChange={(e) => onUpdateField(index, { key: e.target.value })}
                placeholder="Field name (e.g., company, title)"
                className="w-full rounded-lg border border-gray-300 dark:border-dark-300 bg-white dark:bg-dark-50 px-4 py-2 text-gray-900 dark:text-dark-600"
              />
            </div>
            <button
              onClick={() => onRemoveField(index)}
              className="p-2 text-dark-500 hover:text-dark-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {fields.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-dark-400">
            Add custom fields to personalize your campaign messages
          </p>
        )}
      </div>

      <button
        onClick={onAddField}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 hover:bg-dark-400 dark:bg-dark-100 dark:hover:bg-dark-400 rounded-lg text-sm font-medium text-dark-600 hover:text-dark-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Field
      </button>
    </div>
  );
}