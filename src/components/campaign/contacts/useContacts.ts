import { useState, useEffect, useCallback } from 'react';
import { getCampaignContacts } from '../../../services/contacts/campaign-contacts';
import type { CampaignContact } from '../../../services/contacts/types';

export function useContacts(campaignId: string, refreshTrigger: number) {
  const [contacts, setContacts] = useState<CampaignContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const loadContacts = useCallback(async () => {
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
  }, [campaignId]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts, refreshTrigger, refreshCounter]);

  const refresh = useCallback(() => {
    setRefreshCounter(prev => prev + 1);
  }, []);

  return { contacts, loading, error, refresh };
}