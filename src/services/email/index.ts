import { API_BASE_URL } from '../api';

export async function sendInvitationEmail(
  email: string,
  invitationToken: string,
  campaignName: string,
  inviterEmail: string
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: email,
        template: 'campaign-invitation',
        data: {
          inviteUrl: `${window.location.origin}?invite=${invitationToken}`,
          campaignName,
          inviterEmail
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send invitation email');
    }
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw error;
  }
}