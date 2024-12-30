import { supabase } from '../../lib/supabase/client';
import type { CampaignContact } from './types';

export async function updateContactStatuses(contactIds: string[], status: string): Promise<CampaignContact[]> {
  // Update campaign_contacts table
  const { data: updatedContacts, error } = await supabase
    .from('campaign_contacts')
    .update({ contact_status: status })
    .in('campaign_user_id', contactIds)
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
    `);

  if (error) throw error;
  
  return updatedContacts.map(row => ({
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