import React, { useState, useEffect } from 'react';
import { CampaignTabs } from './CampaignTabs';
import { CampaignVersionToggle } from './CampaignVersionToggle';
import { ErrorMessage } from '../ui/ErrorMessage';
import { Button } from '../ui/Button';
import { Play, Pause, Loader2 } from 'lucide-react';
import { getCampaign, launchCampaign, pauseCampaign } from '../../services/campaigns';
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
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
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

  const handleStatusToggle = async () => {
    try {
      setIsUpdatingStatus(true);
      setError(null);
      
      const updatedCampaign = activeCampaign.status === 'Active'
        ? await pauseCampaign(activeCampaign.campaign_id)
        : await launchCampaign(activeCampaign.campaign_id);
      
      setActiveCampaign(updatedCampaign);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update campaign status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
  <div className="p-6">
    <div className="space-y-4">
      <div className="flex justify-between items-start">
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
        <div className="flex gap-4">
          {canEdit && (
            <Button
              onClick={handleStatusToggle}
              disabled={isUpdatingStatus}
              icon={isUpdatingStatus ? Loader2 : activeCampaign.status === 'Active' ? Pause : Play}
              className={isUpdatingStatus ? 'animate-pulse' : ''}
              variant={activeCampaign.status === 'Active' ? 'secondary' : 'primary'}
            >
              {activeCampaign.status === 'Active' 
                ? 'Pause' 
                : 'Launch'}
            </Button>
          )}
          {canEdit && (activeCampaign.child_campaign || activeCampaign.parent_campaign) && (
            <CampaignVersionToggle
              isTestVersion={isTestVersion}
              onToggle={handleVersionToggle}
              disabled={loading}
            />
          )}
        </div>
      </div>
      <p className="text-gray-600 dark:text-dark-400">
        {activeCampaign.goal}
      </p>
    </div>
    <div className="mt-6">
      <CampaignTabs 
        campaign={activeCampaign}
        userRole={userRole}
        loading={loading}
        onCampaignUpdate={handleCampaignUpdate}
      />
    </div>
  </div>);       
}