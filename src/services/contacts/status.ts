import { supabase } from '../../lib/supabase/client';
import type { CampaignContact } from './types';

export async function getContactStatus(contactId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('campaign_contacts')
    .select('contact_status')
    .eq('campaign_user_id', contactId)
    .single();

  if (error) throw error;
  return data?.contact_status || null;
}

async function updatePreviousStatusNote(contactId: string, notes: string): Promise<void> {
  const { data: latestHistory, error: historyError } = await supabase
    .from('contact_status_history')
    .select('history_id, contact_status')
    .eq('campaign_contact_id', contactId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (historyError) throw historyError;

  if (latestHistory) {
    const { error: updateError } = await supabase
      .from('contact_status_history')
      .update({ notes })
      .eq('history_id', latestHistory.history_id);

    if (updateError) throw updateError;
  }
}

export async function updateContactStatuses(
  contactIds: string[], 
  status: string,
  notes?: string
): Promise<CampaignContact[]> {
  if (notes) {
    await Promise.all(contactIds.map(id => updatePreviousStatusNote(id, notes)));
  }

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