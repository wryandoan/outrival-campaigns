import { supabase } from '../lib/supabase/client';

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Return basic user info from auth, no need to query public schema
  return {
    id: user.id,
    email: user.email,
    firstName: user.user_metadata.first_name || user.email?.split('@')[0] || '',
    lastName: user.user_metadata.last_name || '',
    preferredName: user.user_metadata.preferred_name || user.email?.split('@')[0] || '',
    timeZone: user.user_metadata.time_zone || Intl.DateTimeFormat().resolvedOptions().timeZone
  };
}

export async function updateUser(id: string, updates: Record<string, any>) {
  const { error } = await supabase.auth.updateUser({
    data: updates
  });

  if (error) throw error;
}