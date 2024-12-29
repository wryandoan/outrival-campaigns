import { supabase } from '../../lib/supabase/client';
import { generateCampaignConfiguration } from '../ai/generateCampaignConfiguration';
import { DEFAULT_PHONE_NUMBERS } from './constants';
import type { Campaign, NewCampaign, CampaignUpdate } from './types';

export async function createCampaign(campaign: { name: string; goal: string }): Promise<Campaign> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Generate AI scripts
  const configuration = await generateCampaignConfiguration(campaign.goal);

  const { data, error } = await supabase
    .from('campaigns')
    .insert([{
      name: campaign.name,
      goal: campaign.goal,
      owner: user.id,
      status: 'Active',
      start_date: new Date().toISOString().split('T')[0],
      configuration,
      phone_numbers: DEFAULT_PHONE_NUMBERS
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCampaign(campaignId: string): Promise<Campaign> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('campaign_id', campaignId)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Campaign not found');

  return data;
}

export async function getCampaigns(): Promise<Campaign[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('owner', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateCampaign(
  campaignId: string, 
  updates: Partial<CampaignUpdate>
): Promise<Campaign> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('campaigns')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('campaign_id', campaignId)
    .eq('owner', user.id) // Ensure user owns the campaign
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Campaign not found or unauthorized');

  return data;
}

export async function deleteCampaign(campaignId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('campaign_id', campaignId)
    .eq('owner', user.id); // Ensure user owns the campaign

  if (error) throw error;
}

export async function updateCampaignStatus(
  campaignId: string, 
  status: 'Active' | 'Completed'
): Promise<Campaign> {
  return updateCampaign(campaignId, { status });
}

export async function completeCampaign(campaignId: string): Promise<Campaign> {
  return updateCampaign(campaignId, { 
    status: 'Completed',
    end_date: new Date().toISOString().split('T')[0]
  });
}