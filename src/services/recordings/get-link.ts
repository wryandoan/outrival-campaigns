import { API_BASE_URL } from '../api';
import { supabase } from '../../lib/supabase/client';

export async function getRecordingLink(roomName: string, interactionId: string): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/recording/${roomName}?request_id=${interactionId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      }
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Recording not found');
      }
      throw new Error('Failed to fetch recording');
    }

    const data = await response.json();
    return data.recording_link;
  } catch (error) {
    console.error('Error fetching recording:', error);
    throw error;
  }
}