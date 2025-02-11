import { supabase } from '../../lib/supabase/client';
import type { Interaction } from './types';

export async function getInteractionHistory(contactId: string): Promise<Interaction[]> {
  const { data, error } = await supabase
    .from('interactions')
    .select(`
      interaction_id,
      campaign_contact_id,
      communication_type,
      interaction_status,
      interaction_disposition,
      interaction_insight,
      sent_date_time,
      response_date_time,
      response_channel,
      content,
      notes,
      phone_number,
      type,
      created_at,
      updated_at,
      transfer_content,
      transfer_logs
    `)
    .eq('campaign_contact_id', contactId)
    .order('sent_date_time', { ascending: false });

  if (error) throw error;
  console.log("INTERACTIONS", data);
  return data || [];
}