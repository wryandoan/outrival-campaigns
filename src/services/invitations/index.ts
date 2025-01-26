import { API_BASE_URL } from '../api';
import { supabase } from '../../lib/supabase/client';

export async function acceptInvitation(token: string): Promise<boolean> {
  try {
    console.log('[Invitations] Accepting invitation:', token);
    
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/api/v1/invitations/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ token })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[Invitations] Failed to accept invitation:', error);
      return false;
    }

    const data = await response.json();
    console.log('[Invitations] Successfully accepted invitation');
    return data.accepted;
  } catch (error) {
    console.error('[Invitations] Error accepting invitation:', error);
    return false;
  }
}