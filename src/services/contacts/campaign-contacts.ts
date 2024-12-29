import { supabase } from '../../lib/supabase/client';
import type { CampaignContact } from './types';

export async function getCampaignContactId(campaignId: string, contactId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('campaign_contacts')
    .select('campaign_user_id')
    .eq('campaign_id', campaignId)
    .eq('contact_id', contactId)
    .single();

  if (error) {
    console.error('Error fetching campaign contact ID:', error);
    return null;
  }

  return data?.campaign_user_id || null;
}

export async function getCampaignContacts(campaignId: string): Promise<CampaignContact[]> {
  console.log('Fetching contacts for campaign:', campaignId);
  
  const { data, error } = await supabase
    .from('campaign_contacts')
    .select(`
      campaign_user_id,
      contact_id,
      contact_status,
      last_responded_date,
      personalization_fields,
      contacts (
        id,
        first_name,
        last_name,
        preferred_name,
        phone_number
      )
    `)
    .eq('campaign_id', campaignId);

  if (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }

  return data.map(row => ({
    id: row.campaign_user_id,
    contact_id: row.contact_id,
    first_name: row.contacts.first_name,
    last_name: row.contacts.last_name,
    preferred_name: row.contacts.preferred_name,
    phone_number: row.contacts.phone_number,
    contact_status: row.contact_status,
    last_responded_date: row.last_responded_date,
    personalization_fields: row.personalization_fields,
  }));
}