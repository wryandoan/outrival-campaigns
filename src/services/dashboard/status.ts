import { supabase } from '../../lib/supabase/client';

export async function getStatusDistribution(campaignId: string) {
  const { data, error } = await supabase
    .from('campaign_contacts')
    .select('contact_status')
    .eq('campaign_id', campaignId);

  if (error) throw error;

  return data.reduce((acc: Record<string, number>, curr) => {
    acc[curr.contact_status] = (acc[curr.contact_status] || 0) + 1;
    return acc;
  }, {});
}