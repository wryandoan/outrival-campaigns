import { API_BASE_URL } from '../api';
import { getAuthToken } from '../api';
import type { CombinedCampaignData } from '../ai/types';
import type { Campaign } from './types';

export async function updateCampaignConfiguration(
  campaignId: string,
  configuration: CombinedCampaignData
): Promise<Campaign> {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/campaigns/${campaignId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        configuration
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update configuration');
    }

    return response.json();
  } catch (error) {
    console.error('Error updating campaign configuration:', error);
    throw error;
  }
}

export async function publishConfigurationToLive(
  testCampaignId: string,
  liveCampaignId: string
): Promise<void> {
  try {
    // First get the test campaign's configuration
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/campaigns/${testCampaignId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get test campaign');
    }

    const testCampaign = await response.json();
    if (!testCampaign.configuration) {
      throw new Error('Test campaign has no configuration');
    }

    // Update the live campaign with the test configuration
    const updateResponse = await fetch(`${API_BASE_URL}/api/v1/campaigns/${liveCampaignId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        configuration: testCampaign.configuration
      })
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      throw new Error(error.detail || 'Failed to publish configuration');
    }
  } catch (error) {
    console.error('Error publishing configuration:', error);
    throw error;
  }
}