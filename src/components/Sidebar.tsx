import React from 'react';
import { Plus } from 'lucide-react';
import Logo from './Logo';
import { Campaign } from '../types';

interface SidebarProps {
  campaigns: Campaign[];
  activeCampaign: Campaign | null;
  onSelectCampaign: (campaign: Campaign) => void;
  onNewCampaign: () => void;
}

export function Sidebar({ campaigns, activeCampaign, onSelectCampaign, onNewCampaign }: SidebarProps) {
  return (
    <aside className="w-64 h-screen bg-gray-50 dark:bg-dark-25 border-r border-gray-200 dark:border-dark-200 flex flex-col">
      {/* Brand Header */}
      <div className="p-4 border-b border-gray-200 dark:border-dark-200">
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8 text-dark-600" />
          <span className="text-lg font-semibold text-gray-700 dark:text-dark-600">
            OutRival
          </span>
        </div>
      </div>
      
      {/* Campaigns Header */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-500 dark:text-dark-600">
            Campaigns
          </h2>
          <button
            onClick={onNewCampaign}
            className="p-2 hover:bg-gray-200 dark:hover:bg-dark-100 rounded-full transition-colors"
            aria-label="New campaign"
          >
            <Plus className="w-5 h-5 text-gray-600 dark:text-dark-600" />
          </button>
        </div>
      </div>
      
      {/* Scrollable Campaign List */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {campaigns.map((campaign) => (
            <button
              key={campaign.campaign_id}
              onClick={() => onSelectCampaign(campaign)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                activeCampaign?.campaign_id === campaign.campaign_id
                  ? 'bg-dark-100 dark:bg-dark-100 text-dark-600 dark:text-dark-600'
                  : 'text-gray-700 dark:text-dark-600 hover:bg-gray-100 dark:hover:bg-dark-100'
              }`}
            >
              <span className="block truncate">{campaign.name}</span>
            </button>
          ))}
        </div>
      </nav>
    </aside>
  );
}