import { supabase } from '../../lib/supabase/client';
import type { Interaction } from './types';

export async function getInteractionHistory(campaignContactId: string): Promise<Interaction[]> {
  const { data, error } = await supabase
    .from('interactions')
    .select('*')
    .eq('campaign_contact_id', campaignContactId)
    .order('sent_date_time', { ascending: false });

  if (error) throw error;
  return data || [];
}