import { supabase } from '../../lib/supabase/client';

export interface StatusHistoryEntry {
  history_id: string;
  campaign_contact_id: string;
  contact_status: string;
  notes: string | null;
  changed_by: string;
  created_at: string;
}

export async function getContactStatusHistory(campaignContactId: string): Promise<StatusHistoryEntry[]> {
  const { data, error } = await supabase
    .from('contact_status_history')
    .select(`
      history_id,
      campaign_contact_id,
      contact_status,
      notes,
      created_at
    `)
    .eq('campaign_contact_id', campaignContactId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}