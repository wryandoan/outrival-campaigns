import type { Database } from '../../lib/supabase/types';

export type Contact = Database['public']['Tables']['contacts']['Row'];

export interface CampaignContact {
  id: string; // For backward compatibility
  campaign_user_id: string;
  contact_id: string;
  first_name: string;
  last_name: string;
  preferred_name: string | null;
  phone_number: string;
  contact_status: string;
  last_responded_date: string | null;
  personalization_fields?: Record<string, any>;
}