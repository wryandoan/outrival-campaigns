import { supabase } from '../../lib/supabase/client';
import { getAreaCodeInfo, getTimeZoneFromAreaCode } from '../../utils/location';
import type { ImportResult } from '../../types/import';

export async function getFileHeaders(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        // Get first line and split by comma
        const firstLine = text.split('\n')[0];
        // Split by comma and trim whitespace from each header
        const headers = firstLine
          .split(',')
          .map(header => header.trim())
          .filter(header => header.length > 0);
        
        resolve(headers);
      } catch (err) {
        reject(new Error('Failed to parse CSV headers'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    // Read just the first chunk of the file (enough for headers)
    const blob = file.slice(0, 5120); // Read first 5KB which should be enough for headers
    reader.readAsText(blob);
  });
}

export async function uploadFile(file: File, campaignId: string): Promise<string> {
  const filename = `${campaignId}/${auth.user().id}/${file.name}-${Date.now()}`;
  
  const { data, error } = await supabase.storage
    .from('csv-imports')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false
    });
  if (error) throw error;
  return data.path;
}

async function checkExistingContacts(phoneNumbers: string[]): Promise<Array<{ id: string; phone_number: string }>> {
  const { data, error } = await supabase
    .from('contacts')
    .select('id, phone_number')
    .in('phone_number', phoneNumbers);

  if (error) throw error;
  return data || [];
}

async function createNewContacts(contacts: ImportResult['contacts'], existingPhoneNumbers: Set<string>, userId: string) {
  const newContacts = contacts
    .filter(c => !existingPhoneNumbers.has(c.phone_number))
    .map(contact => {
      const areaInfo = getAreaCodeInfo(contact.phone_number);
      return {
        owner_id: userId,
        first_name: contact.first_name,
        last_name: contact.last_name,
        preferred_name: contact.first_name,
        phone_number: contact.phone_number,
        city: areaInfo?.mainCity || null,
        state: areaInfo?.state || null,
        time_zone: getTimeZoneFromAreaCode(contact.phone_number)
      };
    });

  if (newContacts.length === 0) return [];

  const { data, error } = await supabase
    .from('contacts')
    .insert(newContacts)
    .select();

  if (error) throw error;
  return data || [];
}

async function linkContactsToCampaign(
  campaignId: string, 
  contactIds: string[], 
  personalizationFields: Record<string, Record<string, string>>
) {
  // Get contact names for all contacts
  const { data: contacts, error: contactsError } = await supabase
    .from('contacts')
    .select('id, first_name, last_name')
    .in('id', contactIds);

  if (contactsError) throw contactsError;

  const { data: existingLinks } = await supabase
    .from('campaign_contacts')
    .select('contact_id')
    .eq('campaign_id', campaignId)
    .in('contact_id', contactIds);

  const existingContactIds = new Set(existingLinks?.map(link => link.contact_id) || []);
  
  // Only link contacts that aren't already linked to this campaign
  const newLinks = contactIds
    .filter(id => !existingContactIds.has(id))
    .map(contactId => {
      const contact = contacts?.find(c => c.id === contactId);
      const contactName = contact ? `${contact.first_name} ${contact.last_name}`.trim() : '';
      
      // Merge existing personalization fields with Name field
      const fields = {
        ...personalizationFields[contactId],
        'Contact Name': contactName
      };

      return {
        campaign_id: campaignId,
        contact_id: contactId,
        contact_status: 'awaiting_contact',
        personalization_fields: fields,
        assigned_date: new Date().toISOString()
      };
    });

  if (newLinks.length === 0) return;

  const { error } = await supabase
    .from('campaign_contacts')
    .insert(newLinks);

  if (error) throw error;
}

export async function uploadContacts(campaignId: string, importResult: ImportResult): Promise<ImportResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get all phone numbers from both new and existing system contacts
  const phoneNumbers = [
    ...importResult.contacts.map(c => c.phone_number),
    ...(importResult.inSystem?.map(c => c.phone_number) || [])
  ];

  // Check existing contacts
  const existingContacts = await checkExistingContacts(phoneNumbers);
  const existingPhoneNumbers = new Set(existingContacts.map(c => c.phone_number));
  
  // Create new contacts
  const newContacts = await createNewContacts(
    importResult.contacts.filter(c => !existingPhoneNumbers.has(c.phone_number)),
    existingPhoneNumbers,
    user.id
  );

  // Create a map of phone numbers to personalization fields
  const personalizationFields: Record<string, Record<string, string>> = {};
  [...newContacts, ...existingContacts].forEach(contact => {
    const importContact = [
      ...importResult.contacts,
      ...(importResult.inSystem || [])
    ].find(c => c.phone_number === contact.phone_number);
    
    if (importContact?.personalization_fields) {
      personalizationFields[contact.id] = importContact.personalization_fields;
    }
  });

  // Get contact IDs for both new and existing contacts
  const allContactIds = [
    ...newContacts.map(c => c.id),
    ...existingContacts.map(c => c.id)
  ];

  // Link all contacts to campaign with personalization fields
  await linkContactsToCampaign(campaignId, allContactIds, personalizationFields);

  // Return updated import result
  return {
    ...importResult,
    successful: newContacts.length,
    existing: existingContacts.length
  };
}