import { useState, useEffect } from 'react';
import { getResponseRates } from '../services/dashboard/responses';

interface ResponseRates {
  call_response_rate: number;
  sms_response_rate: number;
  total_calls: number;
  calls_answered: number;
  total_sms: number;
  sms_responses: number;
}

export function useResponseRates(campaignId: string) {
  const [rates, setRates] = useState<ResponseRates>({
    call_response_rate: 0,
    sms_response_rate: 0,
    total_calls: 0,
    calls_answered: 0,
    total_sms: 0,
    sms_responses: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRates() {
      try {
        setLoading(true);
        const data = await getResponseRates(campaignId);
        setRates(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load rates');
      } finally {
        setLoading(false);
      }
    }

    fetchRates();
  }, [campaignId]);

  return { rates, loading, error };
}