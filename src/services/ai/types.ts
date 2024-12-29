export interface CampaignScripts {
  outbound: Array<{
    step: string;
    content: string;
  }>;
  inbound: Array<{
    step: string;
    content: string;
  }>;
}

export interface CampaignFunnel {
  funnel_stages: string[];
}

export interface CombinedCampaignData {
  scripts: CampaignScripts;
  funnel_stages: CampaignFunnel['funnel_stages'];
}