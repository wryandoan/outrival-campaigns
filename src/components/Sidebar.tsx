import React from 'react';
import { Plus, LogOut } from 'lucide-react';
import Logo from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../lib/supabase/auth';
import type { Campaign } from '../types';

interface SidebarProps {
  campaigns: Campaign[];
  activeCampaign: Campaign | null;
  onSelectCampaign: (campaign: Campaign) => void;
  onNewCampaign: () => void;
}

export function Sidebar({ campaigns, activeCampaign, onSelectCampaign, onNewCampaign }: SidebarProps) {
  const { signOut } = useAuth();

  // Filter out child campaigns
  const parentCampaigns = campaigns.filter(campaign => !campaign.parent_campaign);

  // Helper to check if a campaign is active (either directly or via its child)
  const isCampaignActive = (campaign: Campaign) => {
    if (!activeCampaign) return false;
    return activeCampaign.campaign_id === campaign.campaign_id || 
           activeCampaign.parent_campaign === campaign.campaign_id;
  };

  return (
    <aside className="w-64 h-screen bg-gray-50 dark:bg-dark-25 border-r border-gray-200 dark:border-dark-200 flex flex-col">
      {/* Brand Header */}
      <div className="p-4 border-b border-gray-200 dark:border-dark-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8 text-dark-600" />
            <span className="text-lg font-semibold text-gray-700 dark:text-dark-600">
              OutRival
            </span>
          </div>
          <ThemeToggle />
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
          {parentCampaigns.map((campaign) => (
            <button
              key={campaign.campaign_id}
              onClick={() => onSelectCampaign(campaign)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                isCampaignActive(campaign)
                  ? 'bg-dark-100 dark:bg-dark-100 text-dark-600 dark:text-dark-600'
                  : 'text-gray-700 dark:text-dark-600 hover:bg-gray-100 dark:hover:bg-dark-100'
              }`}
            >
              <span className="block truncate">{campaign.name}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 dark:border-dark-200">
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-dark-600 hover:bg-gray-100 dark:hover:bg-dark-100 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}