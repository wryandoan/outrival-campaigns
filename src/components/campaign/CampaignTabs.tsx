import React, { useState, useEffect } from 'react';
import { Users, Settings, BarChart3 } from 'lucide-react';
import { CampaignContacts } from './CampaignContacts';
import { CampaignConfiguration } from './CampaignConfiguration';
import { CampaignDashboard } from './dashboard/CampaignDashboard';
import { getCampaign } from '../../services/campaigns';
import type { Campaign } from '../../types';

interface CampaignTabsProps {
  campaign: Campaign;
}

export function CampaignTabs({ campaign: initialCampaign }: CampaignTabsProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contacts' | 'configuration'>('dashboard');
  const [campaign, setCampaign] = useState(initialCampaign);

  useEffect(() => {
    setCampaign(initialCampaign);
    setActiveTab('dashboard');
  }, [initialCampaign.campaign_id]);

  const handleTabChange = async (tab: typeof activeTab) => {
    if (tab === 'configuration') {
      try {
        const updatedCampaign = await getCampaign(campaign.campaign_id);
        setCampaign(updatedCampaign);
      } catch (error) {
        console.error('Failed to refresh campaign:', error);
      }
    }
    setActiveTab(tab);
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 dark:border-dark-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('dashboard')}
            className={`
              flex items-center px-1 py-4 border-b-2 text-sm font-medium
              ${activeTab === 'dashboard'
                ? 'border-dark-300 text-dark-600 dark:border-dark-400 dark:text-dark-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-dark-400 dark:hover:text-dark-600 dark:hover:border-dark-400'}
            `}
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Dashboard
          </button>

          <button
            onClick={() => handleTabChange('contacts')}
            className={`
              flex items-center px-1 py-4 border-b-2 text-sm font-medium
              ${activeTab === 'contacts'
                ? 'border-dark-300 text-dark-600 dark:border-dark-400 dark:text-dark-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-dark-400 dark:hover:text-dark-600 dark:hover:border-dark-400'}
            `}
          >
            <Users className="w-5 h-5 mr-2" />
            Contacts
          </button>

          <button
            onClick={() => handleTabChange('configuration')}
            className={`
              flex items-center px-1 py-4 border-b-2 text-sm font-medium
              ${activeTab === 'configuration'
                ? 'border-dark-300 text-dark-600 dark:border-dark-400 dark:text-dark-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-dark-400 dark:hover:text-dark-600 dark:hover:border-dark-400'}
            `}
          >
            <Settings className="w-5 h-5 mr-2" />
            Configuration
          </button>
        </nav>
      </div>

      <div className="mt-4">
        {activeTab === 'dashboard' ? (
          <CampaignDashboard campaign={campaign} />
        ) : activeTab === 'contacts' ? (
          <CampaignContacts campaign={campaign} />
        ) : (
          <CampaignConfiguration 
            campaign={campaign}
            onUpdate={setCampaign}
          />
        )}
      </div>
    </div>
  );
}