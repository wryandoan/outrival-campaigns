import { useState, useEffect } from 'react';
import { getInteractionTimeline } from '../services/dashboard/interactions';
import type { Interaction } from '../services/interactions/types';

export function useInteractionTimeline(campaignId: string) {
  const [timeline, setTimeline] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTimeline() {
      try {
        setLoading(true);
        const data = await getInteractionTimeline(campaignId);
        setTimeline(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load timeline');
      } finally {
        setLoading(false);
      }
    }

    fetchTimeline();
  }, [campaignId]);

  return { timeline, loading, error };
}