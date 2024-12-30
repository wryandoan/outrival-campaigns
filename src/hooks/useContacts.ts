import { useState, useEffect } from 'react';
import { getCampaignContacts } from '../services/contacts/campaign-contacts';
import type { CampaignContact } from '../services/contacts/types';

export function useContacts(campaignId: string, refreshTrigger: number) {
  const [contacts, setContacts] = useState<CampaignContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadContacts() {
      try {
        setLoading(true);
        const data = await getCampaignContacts(campaignId);
        setContacts(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load contacts');
      } finally {
        setLoading(false);
      }
    }

    loadContacts();
  }, [campaignId, refreshTrigger]);

  return {
    contacts,
    setContacts,
    loading,
    error,
    refresh: () => setContacts([...contacts])
  };
}