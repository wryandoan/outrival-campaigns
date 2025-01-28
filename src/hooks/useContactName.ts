import { useState, useEffect } from 'react';
import { getContactNameFromCampaignContact } from '../services/contacts/contact-name';

export function useContactName(campaignContactId: string) {
  const [contactName, setContactName] = useState('Contact');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let mounted = true;

    async function fetchContactName() {
      if (!campaignContactId) {
        setContactName('Contact');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const name = await getContactNameFromCampaignContact(campaignContactId);
        
        if (mounted) {
          setContactName(name);
          setError(null);
        }
      } catch (error) {
        if (mounted) {
          console.error('Error fetching contact name:', error);
          setError('Failed to load contact name');
          setContactName('Contact');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    
    fetchContactName();

    return () => {
      mounted = false;
    };
  }, [campaignContactId]);

  return { contactName, loading, error };
}