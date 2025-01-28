import { API_BASE_URL } from '../api';
import { getAuthToken } from '../api';
import type { ContactDetails } from '../../types/contact';

export async function getContactDetails(contactId: string): Promise<ContactDetails> {
  try {
    console.log('[Contact Details] Getting details for contact:', contactId);
    const token = await getAuthToken();

    const response = await fetch(
      `${API_BASE_URL}/api/v1/contacts/${contactId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Contact not found');
      }
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch contact details');
    }

    const data = await response.json();
    console.log('[Contact Details] Got contact details');
    return data;
  } catch (error) {
    console.error('[Contact Details] Error fetching details:', error);
    throw error;
  }
}