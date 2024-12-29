import { supabase } from '../../lib/supabase/client';

interface RemoveContactsResult {
  removedFromCampaign: number;
  deletedContacts: number;
}

export async function removeContactsFromCampaign(
  campaignId: string,
  contactIds: string[]
): Promise<RemoveContactsResult> {
  // First remove contacts from the campaign
  const { error: removeError, count: removedCount } = await supabase
    .from('campaign_contacts')
    .delete()
    .eq('campaign_id', campaignId)
    .in('contact_id', contactIds);

  if (removeError) throw removeError;

  // For each contact, check if they're in any other campaigns
  const { data: remainingCampaigns, error: checkError } = await supabase
    .from('campaign_contacts')
    .select('contact_id')
    .in('contact_id', contactIds);

  if (checkError) throw checkError;

  // Get contacts that aren't in any other campaigns
  const contactsToDelete = contactIds.filter(id => 
    !remainingCampaigns?.some(c => c.contact_id === id)
  );

  // Delete contacts that aren't in any other campaigns
  if (contactsToDelete.length > 0) {
    const { error: deleteError, count: deletedCount } = await supabase
      .from('contacts')
      .delete()
      .in('id', contactsToDelete);

    if (deleteError) throw deleteError;

    return {
      removedFromCampaign: removedCount || 0,
      deletedContacts: deletedCount || 0
    };
  }

  return {
    removedFromCampaign: removedCount || 0,
    deletedContacts: 0
  };
}

export async function removeContactsByPhoneNumbers(
  campaignId: string,
  phoneNumbers: string[]
): Promise<RemoveContactsResult> {
  // First get contact IDs from phone numbers
  const { data: contacts, error: lookupError } = await supabase
    .from('contacts')
    .select('id')
    .in('phone_number', phoneNumbers);

  if (lookupError) throw lookupError;

  if (!contacts || contacts.length === 0) {
    return {
      removedFromCampaign: 0,
      deletedContacts: 0
    };
  }

  // Remove contacts using their IDs
  return removeContactsFromCampaign(
    campaignId,
    contacts.map(c => c.id)
  );
}