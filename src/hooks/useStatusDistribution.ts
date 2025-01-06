import { useState, useEffect } from 'react';
import { getStatusDistribution } from '../services/dashboard/status';

interface StatusDistribution {
  [key: string]: number;
}

export function useStatusDistribution(campaignId: string) {
  const [distribution, setDistribution] = useState<StatusDistribution>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDistribution() {
      try {
        setLoading(true);
        const data = await getStatusDistribution(campaignId);
        setDistribution(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load distribution');
      } finally {
        setLoading(false);
      }
    }

    fetchDistribution();
  }, [campaignId]);

  return { distribution, loading, error };
}