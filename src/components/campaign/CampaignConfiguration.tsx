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
  const { updateConfiguration, isUpdating, error } = useCampaignConfiguration({
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

  return (
    <div className="space-y-8">
      {error && <ErrorMessage message={error} />}

      <ScriptViewer
        scripts={campaign.configuration?.scripts}
        onUpdate={(scripts) => handleConfigUpdate({ scripts })}
        disabled={isUpdating}
      />
      
      <FunnelStages
        stages={campaign.configuration?.funnel_stages || []}
        onUpdate={(funnel_stages) => handleConfigUpdate({ funnel_stages })}
        disabled={isUpdating}
      />

      <PhoneNumbersCard 
        campaign={campaign}
        onUpdate={onUpdate}
      />
    </div>
  );
}