import { supabase } from '../../lib/supabase/client';
import type { ContactDetails } from '../../types/contact';

export async function getContactDetails(contactId: string): Promise<ContactDetails> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', contactId)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Contact not found');

  return data;
}