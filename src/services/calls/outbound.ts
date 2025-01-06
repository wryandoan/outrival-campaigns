import { API_BASE_URL } from '../api';

export async function initiateOutboundCall(campaignContactId: string, phoneNumber: string) {
  console.log('Initiating call to:', phoneNumber);
  
  try {
    const url = `${API_BASE_URL}/api/v1/outbound_call`;
    console.log('Making request to:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        campaign_contact_id: campaignContactId
      }),
    });

    console.log('Response status:', response.status);
    
    const data = await response.text();
    console.log('Response data:', data);

    // Safely try to parse JSON
    try {
      return data ? JSON.parse(data) : null;
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      return null;
    }

  } catch (error) {
    console.error('Call initiation error:', error);
    return null;
  }
}