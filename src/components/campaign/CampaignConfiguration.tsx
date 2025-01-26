import React from 'react';
import { FunnelStages } from './FunnelStages';
import { ConfigViewer } from './ConfigViewer';
import { PhoneNumbersCard } from './PhoneNumbersCard';
import { useCampaignConfiguration } from '../../hooks/useCampaignConfiguration';
import { ErrorMessage } from '../ui/ErrorMessage';
import type { Campaign } from '../../types';
import type { CampaignConfiguration } from '../../types/config';

interface CampaignConfigurationProps {
  campaign: Campaign;
  onUpdate?: (campaign: Campaign) => void;
  disabled?: boolean;
}

export function CampaignConfiguration({ campaign, onUpdate, disabled }: CampaignConfigurationProps) {
  const { updateConfiguration, publishToLive, isUpdating, error } = useCampaignConfiguration({
    campaign,
    onUpdate
  });

  const handleConfigUpdate = async (updates: Partial<CampaignConfiguration>) => {
    if (!campaign.configuration) return;

    try {
      const updatedConfiguration = {
        ...campaign.configuration,
        ...updates
      };
      await updateConfiguration(updatedConfiguration);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handlePublishToLive = async () => {
    try {
      await publishToLive();
    } catch (err) {
      // Error is handled by the hook
    }
  };

  // Determine if this is a live campaign (no parent campaign)
  const isLiveCampaign = !campaign.parent_campaign;

  return (
    <div className="space-y-8">
      {error && <ErrorMessage message={error} />}

      <ConfigViewer
        configuration={campaign.configuration}
        campaign={campaign}
        onUpdate={handleConfigUpdate}
        onPublish={handlePublishToLive}
        disabled={isUpdating || isLiveCampaign}
      />

      <PhoneNumbersCard 
        campaign={campaign}
        onUpdate={onUpdate}
        disabled={isLiveCampaign}
      />
    </div>
  );
}