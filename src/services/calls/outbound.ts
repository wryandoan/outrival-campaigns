import { API_BASE_URL } from '../api';
import { updateInteractionNotes } from '../interactions/update';
import { updateContactStatuses, getContactStatus } from '../contacts/status';

export async function initiateOutboundCall(campaignContactId: string, phoneNumber: string) {
  console.log('Initiating call to:', phoneNumber);
  
  try {
    // Get current status before updating to in_progress
    const currentStatus = await getContactStatus(campaignContactId);

    // Update contact status to in_progress and get updated contacts
    const updatedContacts = await updateContactStatuses([campaignContactId], 'in_progress');

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
        campaign_contact_id: campaignContactId
      }),
    });

    console.log('Response status:', response.status);
    
    const data = await response.text();
    console.log('Response data:', data);

    if (!response.ok) {
      // If call fails, update status back to previous status with error note
      await updateContactStatuses(
        [campaignContactId], 
        currentStatus || 'awaiting_contact',
        'Call failed before phone number was contacted.'
      );
    }

    const responseData = data ? JSON.parse(data) : null;

    return { ...responseData, updatedContacts };
  } catch (error) {
    console.error('Call initiation error:', error);
    // Ensure status is reset on error with note
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    await updateContactStatuses(
      [campaignContactId], 
      currentStatus || 'awaiting_contact',
      errorMessage
    );
    throw error;
  }
}