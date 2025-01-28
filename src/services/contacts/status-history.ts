import { API_BASE_URL } from '../api';
import { getAuthToken } from '../api';

export interface StatusHistoryEntry {
  history_id: string;
  campaign_contact_id: string;
  contact_status: string;
  notes: string | null;
  created_at: string;
}

export async function getContactStatusHistory(campaignContactId: string): Promise<StatusHistoryEntry[]> {
  if (!campaignContactId) {
    console.log('[Status History] No campaign contact ID provided');
    return [];
  }

  try {
    console.log('[Status History] Fetching history for campaign contact:', campaignContactId);
    const token = await getAuthToken();

    const response = await fetch(
      `${API_BASE_URL}/api/v1/campaign-contacts/${campaignContactId}/status-history`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.log('[Status History] No history found for campaign contact');
        return [];
      }
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch status history');
    }

    const data = await response.json();
    console.log('[Status History] Got history:', data?.length || 0, 'entries');
    return data || [];
  } catch (error) {
    console.error('[Status History] Error fetching history:', error);
    // Return empty array instead of throwing to prevent UI errors
    return [];
  }
}