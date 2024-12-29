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