import React, { useEffect, useState } from 'react';
import { CampaignTabs } from './CampaignTabs';
import { ErrorMessage } from '../ui/ErrorMessage';
import { getCampaign } from '../../services/campaigns';
import type { Campaign } from '../../types';

interface CampaignDetailsProps {
  campaign: Campaign;
}

export function CampaignDetails({ campaign: initialCampaign }: CampaignDetailsProps) {
  const [campaign, setCampaign] = useState(initialCampaign);
  const [error, setError] = useState<string | null>(null);

  // Update local campaign state when prop changes
  useEffect(() => {
    const refreshCampaign = async () => {
      try {
        const updatedCampaign = await getCampaign(initialCampaign.campaign_id);
        setCampaign(updatedCampaign);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load campaign');
      }
    };
    refreshCampaign();
  }, [initialCampaign.campaign_id]);

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-600">{campaign.name}</h1>
        <p className="mt-2 text-gray-600 dark:text-dark-400">{campaign.goal}</p>
      </div>

      <CampaignTabs campaign={campaign} />
    </div>
  );
}