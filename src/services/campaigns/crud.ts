import { API_BASE_URL } from '../api';
import { getAuthToken } from '../api';
import type { Campaign, NewCampaign, CampaignUpdate } from './types';
import { supabase } from '../../lib/supabase/client';

interface CreateCampaignRequest {
  name: string;
  goal: string;
  phone_region?: string;
  phone_city?: string;
  number_of_primary_numbers?: number;
  number_of_test_numbers?: number;
}

// Helper function to handle timeouts
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 90000): Promise<T> {
  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(() => reject(new Error('Request timed out')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
}

export async function createCampaign(campaign: CreateCampaignRequest): Promise<Campaign> {
  try {
    console.log('[Campaigns] Creating campaign:', campaign.name);
    
    // Get auth token and user in parallel
    const [token, { data: { user } }] = await Promise.all([
      await getAuthToken(),
      supabase.auth.getUser()
    ]);
    
    if (!user) throw new Error('User not authenticated');

    const response = await withTimeout(fetch(`${API_BASE_URL}/api/v1/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: campaign.name,
        goal: campaign.goal,
        phone_region: campaign.phone_region || 'FL',
        phone_city: campaign.phone_city || 'Miami',
        number_of_primary_numbers: campaign.number_of_primary_numbers || 3,
        number_of_test_numbers: campaign.number_of_test_numbers || 1,
        user_id: user.id
      })
    }));

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create campaign');
    }

    return response.json();
  } catch (error) {
    console.error('[Campaigns] Error creating campaign:', error);
    throw error;
  }
}

export async function getCampaign(campaignId: string): Promise<Campaign> {
  try {
    console.log('[Campaigns] Getting campaign:', campaignId);
    const token = await getAuthToken();

    const response = await withTimeout(fetch(`${API_BASE_URL}/api/v1/campaigns/${campaignId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }));

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get campaign');
    }

    return response.json();
  } catch (error) {
    console.error('[Campaigns] Error getting campaign:', error);
    throw error;
  }
}

export async function getCampaigns(): Promise<Campaign[]> {
  try {
    console.log('[Campaigns] Getting all campaigns');
    
    // Get auth token and user in parallel
    const [token, { data: { user } }] = await Promise.all([
      await getAuthToken(),
      supabase.auth.getUser()
    ]);
    
    if (!user) throw new Error('User not authenticated');

    const response = await withTimeout(fetch(
      `${API_BASE_URL}/api/v1/campaigns?user_id=${user.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
    }));

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get campaigns');
    }

    const data = await response.json();
    console.log('[Campaigns] Got campaigns:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('[Campaigns] Error getting campaigns:', error);
    throw error;
  }
}

export async function updateCampaign(
  campaignId: string, 
  updates: Partial<CampaignUpdate>
): Promise<Campaign> {
  try {
    console.log('[Campaigns] Updating campaign:', campaignId);
    const token = await getAuthToken();

    const response = await withTimeout(fetch(`${API_BASE_URL}/api/v1/campaigns/${campaignId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    }));

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update campaign');
    }

    return response.json();
  } catch (error) {
    console.error('[Campaigns] Error updating campaign:', error);
    throw error;
  }

}
export async function launchCampaign(campaignId: string): Promise<Campaign> {
  return updateCampaign(campaignId, { status: 'Active' });
}

export async function pauseCampaign(campaignId: string): Promise<Campaign> {
  return updateCampaign(campaignId, { status: 'Paused' });
}