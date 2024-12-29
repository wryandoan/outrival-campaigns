import { supabase } from '../../lib/supabase/client';
import type { ImportContact } from '../../types/import';

export async function checkExistingSystemContacts(phoneNumbers: string[]) {
  const { data, error } = await supabase
    .from('contacts')
    .select('phone_number')
    .in('phone_number', phoneNumbers);

  if (error) throw error;
  return new Set(data?.map(c => c.phone_number) || []);
}

export async function checkExistingCampaignContacts(
  campaignId: string,
  phoneNumbers: string[]
) {
  const { data, error } = await supabase
    .from('campaign_contacts')
    .select(`
      contact_id,
      contacts!inner (
        phone_number
      )
    `)
    .eq('campaign_id', campaignId)
    .in('contacts.phone_number', phoneNumbers);

  if (error) throw error;
  
  // Extract phone numbers from the joined data
  return new Set(data?.map(row => row.contacts.phone_number) || []);
}

export function categorizeContacts(
  contacts: ImportContact[],
  existingSystem: Set<string>,
  existingCampaign: Set<string>
) {
  return contacts.reduce((acc, contact) => {
    if (existingCampaign.has(contact.phone_number)) {
      acc.inCampaign.push(contact);
    } else if (existingSystem.has(contact.phone_number)) {
      acc.inSystem.push(contact);
    } else {
      acc.toImport.push(contact);
    }
    return acc;
  }, {
    toImport: [] as ImportContact[],
    inSystem: [] as ImportContact[],
    inCampaign: [] as ImportContact[]
  });
}