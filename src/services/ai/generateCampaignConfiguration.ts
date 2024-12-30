import type { CombinedCampaignData } from './types';

export async function generateCampaignConfiguration(goal: string): Promise<CombinedCampaignData> {
  try {
    const url = new URL('https://outrival-api.ngrok.dev/api/v1/create_campaign');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      mode: 'cors',
      body: JSON.stringify({ goal }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API call failed: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`);
    }
    const data = await response.json();
    return {
      scripts: data.scripts,
      funnel_stages: data.funnel_stages
    };
  } catch (error) {
    console.error('Error generating campaign configuration:', error);
    throw error;
  }
}