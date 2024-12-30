import { API_BASE_URL } from '../api';
import { createInteraction } from '../interactions/create';
import { updateInteractionNotes } from '../interactions/update';

export async function initiateOutboundCall(campaignContactId: string, phoneNumber: string) {
  console.log('Initiating call to:', phoneNumber);
  
  try {
    // Create interaction record first
    const interaction = await createInteraction({
      campaign_contact_id: campaignContactId,
      phone_number: phoneNumber,
      type: 'outbound',
      communication_type: 'call'
    });

    // Make API call to initiate the call
    const url = `${API_BASE_URL}/api/v1/outbound_call`;
    console.log('Making request to:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        phone_number: phoneNumber,
        request_id: interaction.interaction_id
      }),
    });

    console.log('Response status:', response.status);
    
    const data = await response.text();
    console.log('Response data:', data);

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText} ${data}`);
    }

    const responseData = data ? JSON.parse(data) : null;
    
    // Update interaction notes with room_id
    if (responseData?.room_name) {
      await updateInteractionNotes(interaction.interaction_id, {
        room_name: responseData.room_name
      });
    }

    return responseData;
  } catch (error) {
    console.error('Call initiation error:', error);
    throw error;
  }
}