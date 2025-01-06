import { useState, useEffect } from 'react';
import { getStatusMetrics, type StatusMetrics } from '../services/dashboard/metrics';

const defaultMetrics: StatusMetrics = {
  total_contacts: 0,
  awaiting_contact: 0,
  in_progress: 0,
  awaiting_reattempt: 0,
  awaiting_followup: 0,
  completed: 0,
};

export function useStatusMetrics(campaignId: string) {
  const [metrics, setMetrics] = useState<StatusMetrics>(defaultMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true);
        const data = await getStatusMetrics(campaignId);
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load metrics');
        setMetrics(defaultMetrics);
      } finally {
        setLoading(false);
      }
    }

    if (campaignId) {
      fetchMetrics();
    }
  }, [campaignId]);

  return { metrics, loading, error };
}