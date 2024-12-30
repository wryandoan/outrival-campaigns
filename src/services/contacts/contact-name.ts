import { supabase } from '../../lib/supabase/client';

export async function getContactNameFromCampaignContact(campaignContactId: string): Promise<string> {
  const { data, error } = await supabase
    .from('campaign_contacts')
    .select(`
      contacts (
        first_name,
        preferred_name
      )
    `)
    .eq('campaign_user_id', campaignContactId)
    .single();

  if (error) {
    console.error('Error fetching contact name:', error);
    return 'Contact';
  }

  if (!data?.contacts) return 'Contact';

  return data.contacts.preferred_name || data.contacts.first_name || 'Contact';
}