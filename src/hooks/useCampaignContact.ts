import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';

export interface CampaignContactDetails {
  next_follow_up_date_time: string | null;
  follow_up_action_item: 'call_back' | 'send_text' | 'none' | null;
}

export function useCampaignContact(campaignContactId: string) {
  const [details, setDetails] = useState<CampaignContactDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetails() {
      if (!campaignContactId) {
        setError('Invalid campaign contact ID');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('campaign_contacts')
          .select('next_follow_up_date_time, follow_up_action_item')
          .eq('campaign_user_id', campaignContactId)
          .single();

        if (error) throw error;
        console.log("useCampaignContact", campaignContactId, data)
        setDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load contact details');
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [campaignContactId]);

  return { details, loading, error };
}