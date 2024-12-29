import type { Database } from '../lib/supabase/types';

// Campaign types
export type Campaign = Database['public']['Tables']['campaigns']['Row'];

// Contact types
export interface Contact {
  name: string;
  phone_number: string;
}

export interface CampaignContact {
  id: string;
  contact_id: string;
  preferred_name: string;
  phone_number: string;
  is_resolved: boolean;
  last_responded_date: string | null;
}

// User types
export interface User {
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  preferredName: string;
  timeZone: string;
}