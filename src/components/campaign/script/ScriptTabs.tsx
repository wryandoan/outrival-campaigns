import React from 'react';

interface ScriptTabsProps {
  activeType: 'outbound' | 'inbound' | 'voicemail' | 'personalization';
  onTabChange: (type: 'outbound' | 'inbound' | 'voicemail' | 'personalization') => void;
}

export function ScriptTabs({ activeType, onTabChange }: ScriptTabsProps) {
  return (
    <div className="flex gap-2 mb-4">
      {(['outbound', 'inbound', 'voicemail', 'personalization'] as const).map((type) => (
        <button
          key={type}
          onClick={() => onTabChange(type)}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium capitalize
            ${activeType === type
              ? 'bg-dark-100 text-dark-600 dark:bg-dark-100 dark:text-dark-600'
              : 'text-gray-600 hover:bg-gray-100 dark:text-dark-400 dark:hover:bg-dark-400 dark:hover:text-dark-600'}
          `}
        >
          {type}
        </button>
      ))}
    </div>
  );
}