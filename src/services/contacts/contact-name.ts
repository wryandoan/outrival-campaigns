import { API_BASE_URL } from '../api';
import { getAuthToken } from '../api';

interface ContactNameResponse {
  first_name: string;
  preferred_name: string | null;
}

export async function getContactNameFromCampaignContact(campaignContactId: string): Promise<string> {
  if (!campaignContactId) {
    return 'Contact';
  }

  try {
    const token = await getAuthToken();
    const response = await fetch(
      `${API_BASE_URL}/api/v1/campaign-contacts/${campaignContactId}/name`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return 'Contact';
      }
      throw new Error(`Failed to fetch contact name: ${response.statusText}`);
    }

    const data = await response.json() as ContactNameResponse;
    return data.name || 'Contact';
  } catch (error) {
    // Log error but don't expose to UI
    console.error('Error fetching contact name:', error);
    return 'Contact';
  }
}