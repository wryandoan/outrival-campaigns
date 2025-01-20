import React from 'react';

interface CampaignVersionToggleProps {
  isTestVersion: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function CampaignVersionToggle({ isTestVersion, onToggle, disabled }: CampaignVersionToggleProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className="relative flex items-center h-8 rounded-lg bg-dark-400/80 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {/* Sliding pill background */}
      <div 
        className={`
          absolute inset-y-0 w-[60px] 
          bg-dark-200
          rounded-lg
          transition-transform duration-200 ease-out
          ${isTestVersion ? 'translate-x-0' : 'translate-x-[60px]'}
        `}
      />
      
      {/* Text container */}
      <div className="relative flex items-center text-sm font-medium">
        <span className={`px-4 py-1.5 ${isTestVersion ? 'text-white' : 'text-dark-600'}`}>
          Test
        </span>
        <span className={`px-4 py-1.5 ${!isTestVersion ? 'text-white' : 'text-dark-600'}`}>
          Live
        </span>
      </div>
    </button>
  );
}