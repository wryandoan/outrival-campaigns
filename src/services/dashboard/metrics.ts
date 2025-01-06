import { supabase } from '../../lib/supabase/client';

export interface StatusMetrics {
  total_contacts: number;
  awaiting_contact: number;
  in_progress: number;
  awaiting_reattempt: number;
  awaiting_followup: number;
  completed: number;
}

export async function getStatusMetrics(campaignId: string): Promise<StatusMetrics> {
  const { data, error } = await supabase
    .from('campaign_contacts')
    .select('contact_status')
    .eq('campaign_id', campaignId);

  if (error) throw error;

  const metrics: StatusMetrics = {
    total_contacts: data.length,
    awaiting_contact: data.filter(c => c.contact_status === 'awaiting_contact').length,
    in_progress: data.filter(c => ['in_progress'].includes(c.contact_status)).length,
    awaiting_reattempt: data.filter(c => c.contact_status === 'awaiting_reattempt').length,
    awaiting_followup: data.filter(c => c.contact_status === 'awaiting_followup').length,
    completed: data.filter(c => c.contact_status === 'completed').length,
  };

  return metrics;
}