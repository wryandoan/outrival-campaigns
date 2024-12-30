import { supabase } from '../../lib/supabase/client';
import type { Interaction } from './types';

export async function updateInteractionNotes(
  interactionId: string,
  notes: Record<string, any>
): Promise<Interaction> {
  const { data, error } = await supabase
    .from('interactions')
    .update({
      notes: JSON.stringify(notes)
    })
    .eq('interaction_id', interactionId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to update interaction');

  return data;
}