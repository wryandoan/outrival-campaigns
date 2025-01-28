import { API_BASE_URL } from '../api';
import { getAuthToken } from '../api';
import type { Campaign } from '../../types';

export async function getContactCampaigns(contactId: string): Promise<Campaign[]> {
  try {
    console.log('[Contact Campaigns] Getting campaigns for contact:', contactId);
    const token = await getAuthToken();

    const response = await fetch(
      `${API_BASE_URL}/api/v1/contacts/${contactId}/campaigns`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch contact campaigns');
    }

    const data = await response.json();
    console.log('[Contact Campaigns] Got campaigns:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('[Contact Campaigns] Error fetching campaigns:', error);
    throw error;
  }
}