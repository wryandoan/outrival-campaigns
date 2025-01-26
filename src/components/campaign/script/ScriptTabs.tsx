import React from 'react';
import { MessageSquare, Settings, Bot } from 'lucide-react';

interface ScriptTabsProps {
  activeType: 'outbound' | 'inbound' | 'voicemail' | 'personalization' | 'configuration';
  onTabChange: (type: 'outbound' | 'inbound' | 'voicemail' | 'personalization' | 'configuration') => void;
}

export function ScriptTabs({ activeType, onTabChange }: ScriptTabsProps) {
  return (
    <div className="flex gap-2 mb-4">
      {(['outbound', 'inbound', 'voicemail', 'personalization', 'configuration'] as const).map((type) => {
        let Icon = MessageSquare;
        if (type === 'personalization') Icon = Settings;
        if (type === 'configuration') Icon = Bot;

        return (
          <button
            key={type}
            onClick={() => onTabChange(type)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium capitalize
              ${activeType === type
                ? 'bg-dark-100 text-dark-600 dark:bg-dark-100 dark:text-dark-600'
                : 'text-gray-600 hover:bg-gray-100 dark:text-dark-400 dark:hover:bg-dark-400 dark:hover:text-dark-600'}
            `}
          >
            <Icon className="w-4 h-4" />
            {type}
          </button>
        );
      })}
    </div>
  );
}