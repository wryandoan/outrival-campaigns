import { API_BASE_URL } from '../api';
import { getAuthToken } from '../api';
import type { CampaignContact } from './types';

interface ContactsResponse {
  data: CampaignContact[];
  meta: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
  };
}

interface ContactFilters {
  search?: string;
  status?: string;
}

export async function getCampaignContactId(campaignId: string, contactId: string): Promise<string | null> {
  if (!campaignId || !contactId) {
    console.log('[Campaign Contacts] Missing required parameters:', { campaignId, contactId });
    return null;
  }

  try {
    console.log('[Campaign Contacts] Getting campaign contact ID:', { campaignId, contactId });
    const token = await getAuthToken();
    const response = await fetch(
      `${API_BASE_URL}/api/v1/campaigns/${campaignId}/contacts/${contactId}/id`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.log('[Campaign Contacts] Contact ID not found');
        return null;
      }
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch campaign contact ID');
    }

    const result = await response.json() as CampaignContactIdResponse;
    if (!result?.campaign_user_id) {
      console.log('[Campaign Contacts] No campaign contact ID in response');
      return null;
    }

    console.log('[Campaign Contacts] Got campaign contact ID:', result.campaign_user_id);
    return result.campaign_user_id;
  } catch (error) {
    console.error('[Campaign Contacts] Error fetching campaign contact ID:', error);
    return null;
  }
}

export async function getCampaignContacts(
  campaignId: string,
  page: number = 1,
  pageSize: number = 50,
  filters?: ContactFilters
): Promise<ContactsResponse> {
  console.log('[Campaign Contacts] Fetching contacts:', { campaignId, page, pageSize, filters });
  
  try {
    const token = await getAuthToken();
    console.log('[Campaign Contacts] Got auth token');

    // Build URL with query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString()
    });

    // Add filters if provided
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }

    const url = `${API_BASE_URL}/api/v1/campaigns/${campaignId}/contacts?${params.toString()}`;
    console.log('[Campaign Contacts] Making request to:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    console.log('[Campaign Contacts] Response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('[Campaign Contacts] Response error:', error);
      throw new Error(error.detail || 'Failed to fetch campaign contacts');
    }

    const result = await response.json();
    console.log('[Campaign Contacts] Raw response:', result);
    
    // Transform the response to match our expected format
    const transformedData = result.data.map((contact: any) => {
      // Ensure campaign_user_id is set from the correct field
      const campaign_user_id = contact.campaign_user_id || contact.id;
      
      if (!campaign_user_id) {
        console.error('[Campaign Contacts] Missing campaign_user_id for contact:', contact);
      }

      return {
        id: campaign_user_id, // Keep id for backward compatibility
        campaign_user_id: campaign_user_id,
        contact_id: contact.contact_id,
        first_name: contact.contacts?.first_name || contact.first_name,
        last_name: contact.contacts?.last_name || contact.last_name,
        preferred_name: contact.contacts?.preferred_name || contact.preferred_name,
        phone_number: contact.contacts?.phone_number || contact.phone_number,
        contact_status: contact.contact_status,
        last_responded_date: contact.last_responded_date,
        personalization_fields: contact.personalization_fields
      };
    });

    const response_data: ContactsResponse = {
      data: transformedData,
      meta: result.meta || {
        page,
        page_size: pageSize,
        total_count: transformedData.length,
        total_pages: 1
      }
    };

    console.log('[Campaign Contacts] Transformed response:', {
      count: response_data.data.length,
      meta: response_data.meta
    });

    return response_data;
  } catch (error) {
    console.error('[Campaign Contacts] Error fetching campaign contacts:', error);
    throw error;
  }
}
