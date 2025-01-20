import React, { useEffect, useState } from 'react';
import { CampaignTabs } from './CampaignTabs';
import { CampaignVersionToggle } from './CampaignVersionToggle';
import { ErrorMessage } from '../ui/ErrorMessage';
import { getCampaign } from '../../services/campaigns';
import { getUserRole } from '../../services/campaigns/members';
import type { Campaign } from '../../types';
import type { CampaignMemberRole } from '../../services/campaigns/members';

interface CampaignDetailsProps {
  campaign: Campaign;
}

export function CampaignDetails({ campaign: initialCampaign }: CampaignDetailsProps) {
  const [activeCampaign, setActiveCampaign] = useState<Campaign>(initialCampaign);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<CampaignMemberRole | 'owner' | null>(null);
  
  // Always initialize to live version (isTestVersion = false)
  const [isTestVersion, setIsTestVersion] = useState(false);

  // Check if user has edit permissions
  const canEdit = userRole === 'owner' || userRole === 'editor' || userRole === 'admin';

  // Load campaign data and user role
  const loadCampaignData = async (campaignId: string, isTest: boolean) => {
    try {
      setLoading(true);
      
      // If we're loading the initial data and this is a test version,
      // switch to the parent (live) campaign
      if (!isTest && initialCampaign.parent_campaign) {
        campaignId = initialCampaign.parent_campaign;
      }
      
      // Get the campaign and its role
      const [campaign, role] = await Promise.all([
        getCampaign(campaignId),
        getUserRole(campaignId)
      ]);

      setActiveCampaign(campaign);
      setUserRole(role);
      setIsTestVersion(isTest);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaign');
    } finally {
      setLoading(false);
    }
  };

  // Initial load - always start with live version
  useEffect(() => {
    loadCampaignData(initialCampaign.campaign_id, false);
  }, [initialCampaign.campaign_id]);

  const handleVersionToggle = async () => {
    if (!activeCampaign) return;

    // Determine the target campaign ID based on current version
    const targetId = isTestVersion 
      ? activeCampaign.parent_campaign 
      : activeCampaign.child_campaign;

    if (!targetId) {
      setError('No test version available for this campaign');
      return;
    }

    try {
      // Pass the new isTest state to loadCampaignData
      await loadCampaignData(targetId, !isTestVersion);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch campaign version');
    }
  };

  const handleCampaignUpdate = (updatedCampaign: Campaign) => {
    setActiveCampaign(updatedCampaign);
  };

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-600">
              {activeCampaign.name}
            </h1>
            <div className={`
              px-2 py-0.5 text-sm font-medium rounded-full
              ${isTestVersion 
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'
                : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
              }
            `}>
              {isTestVersion ? 'Test' : 'Live'}
            </div>
          </div>
          <p className="mt-2 text-gray-600 dark:text-dark-400">
            {activeCampaign.goal}
          </p>
        </div>
        {canEdit && (activeCampaign.child_campaign || activeCampaign.parent_campaign) && (
          <div className="pt-1">
            <CampaignVersionToggle
              isTestVersion={isTestVersion}
              onToggle={handleVersionToggle}
              disabled={loading}
            />
          </div>
        )}
      </div>
      <CampaignTabs 
        campaign={activeCampaign}
        userRole={userRole}
        loading={loading}
        onCampaignUpdate={handleCampaignUpdate}
      />
    </div>
  );
}