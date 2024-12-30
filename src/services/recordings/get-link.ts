import { API_BASE_URL } from '../api';

export async function getRecordingLink(roomId: string, interactionId: string): Promise<string | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/recording/${roomId}?request_id=${interactionId}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch recording link: ${response.status}`);
    }

    const data = await response.json();
    return data.url || null;
  } catch (error) {
    console.error('Error fetching recording link:', error);
    return null;
  }
}