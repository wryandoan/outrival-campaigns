import { API_BASE_URL } from '../api';
import type { Campaign } from './types';
import { getAuthToken } from '../api';

export async function updateCampaignPhoneNumbers(
  campaignId: string,
  phoneNumbers: Campaign['phone_numbers']
): Promise<Campaign> {
  try {
    const token = await getAuthToken();
    const response = await fetch(
      `${API_BASE_URL}/api/v1/campaigns/${campaignId}/phone-numbers`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phone_numbers: phoneNumbers
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update phone numbers');
    }

    return response.json();
  } catch (error) {
    console.error('Error updating phone numbers:', error);
    throw error;
  }
}