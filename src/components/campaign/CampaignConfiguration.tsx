import React from 'react';
import { FunnelStages } from './FunnelStages';
import { ScriptViewer } from './ScriptViewer';
import { PhoneNumbersCard } from './PhoneNumbersCard';
import { useCampaignConfiguration } from '../../hooks/useCampaignConfiguration';
import { ErrorMessage } from '../ui/ErrorMessage';
import type { Campaign } from '../../types';

interface CampaignConfigurationProps {
  campaign: Campaign;
  onUpdate?: (campaign: Campaign) => void;
}

export function CampaignConfiguration({ campaign, onUpdate }: CampaignConfigurationProps) {
  const { updateConfiguration, publishToLive, isUpdating, error } = useCampaignConfiguration({
    campaign,
    onUpdate
  });

  const handleConfigUpdate = async (updates: Partial<Campaign['configuration']>) => {
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

      <ScriptViewer
        scripts={campaign.configuration?.scripts}
        campaign={campaign}
        onUpdate={(scripts) => handleConfigUpdate({ scripts })}
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