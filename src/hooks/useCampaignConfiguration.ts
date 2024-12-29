import { useState, useCallback } from 'react';
import { updateCampaignConfiguration } from '../services/campaigns/updateConfiguration';
import type { CombinedCampaignData } from '../services/ai/types';
import type { Campaign } from '../types';

interface UseCampaignConfigurationProps {
  campaign: Campaign;
  onUpdate?: (campaign: Campaign) => void;
}

export function useCampaignConfiguration({ campaign, onUpdate }: UseCampaignConfigurationProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateConfiguration = useCallback(async (configuration: CombinedCampaignData) => {
    try {
      setIsUpdating(true);
      setError(null);
      const updatedCampaign = await updateCampaignConfiguration(
        campaign.campaign_id,
        configuration
      );
      onUpdate?.(updatedCampaign);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update configuration');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [campaign.campaign_id, onUpdate]);

  return {
    updateConfiguration,
    isUpdating,
    error
  };
}