import { supabase } from '../../lib/supabase/client';
import type { Interaction } from '../interactions/types';

export async function getInteractionTimeline(campaignId: string): Promise<Interaction[]> {
  const { data, error } = await supabase
    .from('interactions')
    .select(`
      *,
      campaign_contacts!inner(campaign_id)
    `)
    .eq('campaign_contacts.campaign_id', campaignId)
    .in('interaction_status', ['Completed', 'Failed'])
    .order('sent_date_time', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data;
}