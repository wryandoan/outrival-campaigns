import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';

export interface CampaignContactDetails {
  contact_status: string;
  followup_details?: {
    type: 'call' | 'sms';
    time: string;
  };
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
          .from('contact_status_history')
          .select('contact_status, notes, created_at')
          .eq('campaign_contact_id', campaignContactId)
          .in('contact_status', ['awaiting_followup', 'awaiting_reattempt'])
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;

        let followupDetails;
        if (data?.notes) {
          try {
            const parsed = JSON.parse(data.notes);
            if (parsed.followup_details) {
              followupDetails = parsed.followup_details;
            }
          } catch (e) {
            console.error('Failed to parse follow-up details:', e);
          }
        }

        setDetails({
          contact_status: data?.contact_status || 'unknown',
          followup_details: followupDetails
        });
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