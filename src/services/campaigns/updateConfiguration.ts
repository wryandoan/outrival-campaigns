import { supabase } from '../../lib/supabase/client';
import type { CombinedCampaignData } from '../ai/types';
import type { Campaign } from './types';

export async function updateCampaignConfiguration(
  campaignId: string,
  configuration: CombinedCampaignData
): Promise<Campaign> {
  const { data, error } = await supabase
    .from('campaigns')
    .update({ configuration })
    .eq('campaign_id', campaignId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Campaign not found');

  return data;
}

export async function publishConfigurationToLive(
  testCampaignId: string,
  liveCampaignId: string
): Promise<void> {
  // First get the test campaign's configuration
  const { data: testCampaign, error: testError } = await supabase
    .from('campaigns')
    .select('configuration')
    .eq('campaign_id', testCampaignId)
    .single();

  if (testError) throw testError;
  if (!testCampaign) throw new Error('Test campaign not found');

  // Update the live campaign with the test configuration
  const { error: updateError } = await supabase
    .from('campaigns')
    .update({ configuration: testCampaign.configuration })
    .eq('campaign_id', liveCampaignId);

  if (updateError) throw updateError;
}