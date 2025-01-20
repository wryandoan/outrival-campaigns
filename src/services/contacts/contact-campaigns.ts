import { supabase } from '../../lib/supabase/client';
import type { Campaign } from '../../types';

export async function getContactCampaigns(contactId: string): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from('campaign_contacts')
    .select(`
      campaign:campaigns (
        campaign_id,
        name,
        status,
        goal,
        start_date,
        end_date,
        parent_campaign,
        child_campaign
      )
    `)
    .eq('contact_id', contactId);

  if (error) {
    console.error('Error fetching contact campaigns:', error);
    throw error;
  }

  return data.map(row => row.campaign);
}