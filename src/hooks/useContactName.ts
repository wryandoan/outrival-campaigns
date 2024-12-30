import { useState, useEffect } from 'react';
import { getContactNameFromCampaignContact } from '../services/contacts/contact-name';

export function useContactName(campaignContactId: string) {
  const [contactName, setContactName] = useState('Contact');
  
  useEffect(() => {
    async function fetchContactName() {
      try {
        const name = await getContactNameFromCampaignContact(campaignContactId);
        setContactName(name);
      } catch (error) {
        console.error('Error fetching contact name:', error);
      }
    }
    
    fetchContactName();
  }, [campaignContactId]);

  return { contactName };
}