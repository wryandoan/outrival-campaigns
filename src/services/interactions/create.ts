import { supabase } from '../../lib/supabase/client';
import type { Interaction } from './types';

export async function createInteraction(data: {
  campaign_contact_id: string;
  phone_number: string;
  type: 'inbound' | 'outbound';
  communication_type: 'call' | 'sms' | 'email';
}): Promise<Interaction> {
  const { data: interaction, error } = await supabase
    .from('interactions')
    .insert({
      campaign_contact_id: data.campaign_contact_id,
      phone_number: data.phone_number,
      type: data.type,
      communication_type: data.communication_type,
      interaction_status: 'Pending'
    })
    .select()
    .single();

  if (error) throw error;
  if (!interaction) throw new Error('Failed to create interaction');

  return interaction;
}