import { supabase } from '../../lib/supabase/client';
import type { Campaign } from '../../types';

export async function updateCampaignPhoneNumbers(
  campaignId: string,
  phoneNumbers: Campaign['phone_numbers']
): Promise<Campaign> {
  const { data, error } = await supabase
    .from('campaigns')
    .update({ phone_numbers: phoneNumbers })
    .eq('campaign_id', campaignId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Campaign not found');

  return data;
}