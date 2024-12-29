import type { Database } from '../../lib/supabase/types';

export type Campaign = Database['public']['Tables']['campaigns']['Row'];
export type NewCampaign = Database['public']['Tables']['campaigns']['Insert'];
export type CampaignUpdate = Database['public']['Tables']['campaigns']['Update'];