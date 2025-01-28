import { useState, useEffect, useCallback } from 'react';
import { getContactStatusHistory } from '../services/contacts/status-history';
import type { StatusHistoryEntry } from '../services/contacts/status-history';

export function useStatusHistory(contactId: string | null) {
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!contactId) {
      console.log('[useStatusHistory] No contact ID provided');
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      console.log('[useStatusHistory] Loading history for:', contactId);
      setLoading(true);
      const data = await getContactStatusHistory(contactId);
      setHistory(data);
      setError(null);
      console.log('[useStatusHistory] History loaded:', data.length, 'entries');
    } catch (err) {
      console.error('[useStatusHistory] Error loading history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load status history');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    let mounted = true;

    const fetchHistory = async () => {
      try {
        await loadHistory();
      } catch (err) {
        if (mounted) {
          console.error('[useStatusHistory] Error in effect:', err);
        }
      }
    };

    fetchHistory();

    return () => {
      mounted = false;
    };
  }, [loadHistory]);

  const refresh = useCallback(() => {
    console.log('[useStatusHistory] Refreshing history');
    loadHistory();
  }, [loadHistory]);

  return {
    history,
    loading,
    error,
    refresh
  };
}