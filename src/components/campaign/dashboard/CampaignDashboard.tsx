import React from 'react';
import { StatusMetrics } from './StatusMetrics';
import { InteractionTimeline } from './InteractionTimeline';
import { StatusDistribution } from './StatusDistribution';
import { ResponseRates } from './ResponseRates';
import { InsightDistribution } from './InsightDistribution';
import type { Campaign } from '../../../types';

interface CampaignDashboardProps {
  campaign: Campaign;
}

export function CampaignDashboard({ campaign }: CampaignDashboardProps) {
  return (
    <div className="space-y-6">
      <StatusMetrics campaignId={campaign.campaign_id} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResponseRates campaignId={campaign.campaign_id} />
        <InsightDistribution campaignId={campaign.campaign_id} />
      </div>
      
      <InteractionTimeline campaignId={campaign.campaign_id} />
    </div>
  );
}