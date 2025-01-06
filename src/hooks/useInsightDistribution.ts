import { useState, useEffect } from 'react';
import { getResponseRates } from '../services/dashboard/responses';

// Define interface to match the return type of getResponseRates
interface ResponseRates {
  call_outcomes: {
    outbound_made: {
      success_response: number;
      dnc_request: number;
      unsubscribe_request: number;
      not_interested: number;
      call_followup_requested: number;
      sms_followup_requested: number;
      voicemail_left: number;
    };
    outbound_attempted: {
      network_error: number;
      invalid_number: number;
      no_answer: number;
    };
    inbound: {
      success_response: number;
      dnc_request: number;
      unsubscribe_request: number;
      not_interested: number;
      call_followup_requested: number;
      sms_followup_requested: number;
    };
    inbound_failed: {
      network_error: number;
      invalid_number: number;
      no_answer: number;
    };
  };
}

export function useInsightDistribution(campaignId: string) {
  const [insights, setInsights] = useState<ResponseRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInsights() {
      try {
        setLoading(true);
        const data = await getResponseRates(campaignId);
        setInsights(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load insights');
      } finally {
        setLoading(false);
      }
    }

    if (campaignId) {
      fetchInsights();
    }
  }, [campaignId]);

  return { insights, loading, error };
}