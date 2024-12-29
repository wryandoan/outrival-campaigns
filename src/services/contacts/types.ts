import type { Database } from '../../lib/supabase/types';

export type Contact = Database['public']['Tables']['contacts']['Row'];
export type CampaignContact = {
  id: string;
  contact_id: string;
  first_name: string;
  last_name: string;
  preferred_name: string;
  phone_number: string;
  contact_status: string;
  last_responded_date: string | null;
};