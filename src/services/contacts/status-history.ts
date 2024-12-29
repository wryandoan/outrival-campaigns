import { supabase } from '../../lib/supabase/client';

export interface StatusHistoryEntry {
  history_id: string;
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
      contact_status,
      notes,
      changed_by,
      created_at
    `)
    .eq('campaign_contact_id', campaignContactId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateContactStatus(
  campaignContactId: string,
  status: string,
  notes?: string
): Promise<void> {
  const { error: updateError } = await supabase
    .from('campaign_contacts')
    .update({ contact_status: status })
    .eq('campaign_user_id', campaignContactId);

  if (updateError) throw updateError;

  if (notes) {
    const { error: historyError } = await supabase
      .from('contact_status_history')
      .insert({
        campaign_contact_id: campaignContactId,
        contact_status: status,
        notes,
        changed_by: (await supabase.auth.getUser()).data.user?.id
      });

    if (historyError) throw historyError;
  }
}