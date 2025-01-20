import React, { useState, useEffect } from 'react';
import { Users, Settings, BarChart3, UserPlus } from 'lucide-react';
import { CampaignContacts } from './CampaignContacts';
import { CampaignConfiguration } from './CampaignConfiguration';
import { CampaignDashboard } from './dashboard/CampaignDashboard';
import { CampaignMembers } from './CampaignMembers';
import { getCampaign } from '../../services/campaigns';
import { getCampaignMembers } from '../../services/campaigns/members';
import type { Campaign } from '../../types';
import type { CampaignMember, CampaignMemberRole } from '../../services/campaigns/members';

interface CampaignTabsProps {
  campaign: Campaign;
  userRole: CampaignMemberRole | 'owner' | null;
  loading?: boolean;
  onCampaignUpdate?: (campaign: Campaign) => void;
}

export function CampaignTabs({ 
  campaign, 
  userRole, 
  loading = false,
  onCampaignUpdate 
}: CampaignTabsProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contacts' | 'configuration' | 'members'>('dashboard');
  const [members, setMembers] = useState<CampaignMember[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Reset to dashboard when campaign changes
  useEffect(() => {
    setActiveTab('dashboard');
  }, [campaign.campaign_id]);

  useEffect(() => {
    async function loadMembers() {
      try {
        const membersList = await getCampaignMembers(campaign.campaign_id);
        setMembers(membersList);
      } catch (error) {
        console.error('Failed to load members:', error);
      }
    }
    loadMembers();
  }, [campaign.campaign_id]);

  const handleTabChange = async (tab: typeof activeTab) => {
    // If switching to configuration tab, refresh campaign data
    if (tab === 'configuration' && !refreshing) {
      try {
        setRefreshing(true);
        const updatedCampaign = await getCampaign(campaign.campaign_id);
        onCampaignUpdate?.(updatedCampaign);
      } catch (error) {
        console.error('Failed to refresh campaign:', error);
      } finally {
        setRefreshing(false);
      }
    }
    setActiveTab(tab);
  };

  const canEdit = userRole === 'owner' || userRole === 'editor' || userRole === 'admin';
  const isTestCampaign = Boolean(campaign.parent_campaign);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 dark:bg-dark-200 rounded w-full mb-4"></div>
        <div className="h-32 bg-gray-200 dark:bg-dark-200 rounded"></div>
      </div>
    );
  }

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
            <Settings className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Configuration
          </button>

          {/* Only show Members tab for live campaigns */}
          {!isTestCampaign && (
            <button
              onClick={() => handleTabChange('members')}
              className={`
                flex items-center px-1 py-4 border-b-2 text-sm font-medium
                ${activeTab === 'members'
                  ? 'border-dark-300 text-dark-600 dark:border-dark-400 dark:text-dark-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-dark-400 dark:hover:text-dark-600 dark:hover:border-dark-400'}
              `}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Members
            </button>
          )}
        </nav>
      </div>

      <div className="mt-4">
        {activeTab === 'dashboard' ? (
          <CampaignDashboard campaign={campaign} />
        ) : activeTab === 'contacts' ? (
          <CampaignContacts 
            campaign={campaign}
            userRole={userRole}
          />
        ) : activeTab === 'members' && !isTestCampaign ? (
          <CampaignMembers
            campaignId={campaign.campaign_id}
            members={members}
            userRole={userRole}
            onMemberUpdate={() => {
              getCampaignMembers(campaign.campaign_id).then(setMembers);
            }}
          />
        ) : (
          <CampaignConfiguration 
            campaign={campaign}
            disabled={!canEdit}
          />
        )}
      </div>
    </div>
  );
}