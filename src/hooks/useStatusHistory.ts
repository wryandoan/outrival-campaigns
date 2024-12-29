import { useState, useEffect } from 'react';
import { getContactStatusHistory } from '../services/contacts/status-history';
import type { StatusHistoryEntry } from '../services/contacts/status-history';

export function useStatusHistory(contactId: string) {
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      if (!contactId) {
        setError('Invalid contact ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getContactStatusHistory(contactId);
        setHistory(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load status history');
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [contactId]);

  return {
    history,
    loading,
    error,
    refresh: () => {
      setLoading(true);
      setError(null);
    }
  };
}