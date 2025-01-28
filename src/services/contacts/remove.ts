import { API_BASE_URL } from '../api';
import { getAuthToken } from '../api';

interface RemoveContactsResult {
  removed_from_campaign: number;
  deleted_contacts: number;
}

export async function removeContactsFromCampaign(
  campaignId: string,
  contactIds: string[]
): Promise<RemoveContactsResult> {
  try {
    const token = await getAuthToken();
    const response = await fetch(
      `${API_BASE_URL}/api/v1/campaigns/${campaignId}/contacts`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ contact_ids: contactIds })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to remove contacts');
    }

    return await response.json();
  } catch (error) {
    console.error('Error removing contacts:', error);
    throw error;
  }
}

export async function removeContactsByPhoneNumbers(
  campaignId: string,
  phoneNumbers: string[]
): Promise<RemoveContactsResult> {
  try {
    const token = await getAuthToken();
    const response = await fetch(
      `${API_BASE_URL}/api/v1/campaigns/${campaignId}/contacts/by-phone`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phone_numbers: phoneNumbers })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to remove contacts');
    }

    return await response.json();
  } catch (error) {
    console.error('Error removing contacts by phone:', error);
    throw error;
  }
}
