import type { Database } from '../lib/supabase/types';

type Campaign = Database['public']['Tables']['campaigns']['Row'];

const API_BASE_URL = 'https://outrival-api.ngrok.dev/api';

export async function initiateOutboundCall(campaign: Campaign) {
  try {
    const response = await fetch(`${API_BASE_URL}/bot/outbound-call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: campaign.user_id,
        llm_context: [
          {
            content: {
              role: 'system',
              content: campaign.prompt,
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.message ||
        errorData.detail?.[0]?.msg || `HTTP Error: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'An unexpected error occurred while initiating the call.';
    console.error(`Error during outbound call: ${message}`);
    throw new Error(message);
  }
}