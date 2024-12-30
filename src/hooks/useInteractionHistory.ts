import { useState, useEffect } from 'react';
import { getInteractionHistory } from '../services/interactions/history';
import type { Interaction } from '../services/interactions/types';

export function useInteractionHistory(contactId: string) {
  const [history, setHistory] = useState<Interaction[]>([]);
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
        const data = await getInteractionHistory(contactId);
        setHistory(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load interaction history');
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