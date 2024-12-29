import { generateScripts } from './generateScripts';
import { generateFunnel } from './generateFunnel';
import type { CombinedCampaignData } from './types';

export async function generateCampaignConfiguration(goal: string): Promise<CombinedCampaignData> {
  const [scripts, funnel] = await Promise.all([
    generateScripts(goal),
    generateFunnel(goal)
  ]);

  return {
    scripts,
    funnel_stages: funnel.funnel_stages
  };
}