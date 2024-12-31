import { API_BASE_URL } from '../api';
import { updateInteractionNotes } from '../interactions/update';
import { updateContactStatuses } from '../contacts/status';

export async function initiateOutboundCall(campaignContactId: string, phoneNumber: string) {
  console.log('Initiating call to:', phoneNumber);
  
  try {
    // Update contact status to in_progress and get updated contacts first
    const updatedContacts = await updateContactStatuses([campaignContactId], 'in_progress');

    // Make API call to initiate the call
    const url = `${API_BASE_URL}/api/v1/outbound_cal`;
    console.log('Making request to:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        phone_number: phoneNumber
      }),
    });

    console.log('Response status:', response.status);
    
    const data = await response.text();
    console.log('Response data:', data);

    if (!response.ok) {
      // If call fails, update status back to awaiting_contact with error note
      const errorMessage = `Call failed: ${response.status} ${response.statusText}`;
      await updateContactStatuses(
        [campaignContactId], 
        'awaiting_contact',
        errorMessage
      );
      /*throw new Error(`API call failed: ${response.status} ${response.statusText} ${data}`);*/
    }

    const responseData = data ? JSON.parse(data) : null;
    
    // Update interaction notes with room_name
    if (responseData?.room_name) {
      await updateInteractionNotes(interaction.interaction_id, {
        room_name: responseData.room_name
      });
    }

    return { ...responseData, updatedContacts };
  } catch (error) {
    console.error('Call initiation error:', error);
    // Ensure status is reset on error with note
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    await updateContactStatuses(
      [campaignContactId], 
      'awaiting_contact',
      errorMessage
    );
    throw error;
  }
}