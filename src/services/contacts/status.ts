import { supabase } from '../../lib/supabase/client';
import type { CampaignContact } from './types';

export async function getContactStatus(contactId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('campaign_contacts')
    .select('contact_status')
    .eq('campaign_user_id', contactId)
    .single();

  if (error) throw error;
  return data?.contact_status || null;
}