import { supabase } from '../../lib/supabase/client';
import { generateCampaignConfiguration } from '../ai/generateCampaignConfiguration';
import { generatePhoneNumbers } from '../numbers/generatePhoneNumbers';
import type { Campaign, NewCampaign, CampaignUpdate } from './types';

export async function createCampaign(campaign: { name: string; goal: string }): Promise<Campaign> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Generate AI scripts and fetch phone numbers in parallel
  const [configuration, phoneNumbers, testPhoneNumber] = await Promise.all([
    generateCampaignConfiguration(campaign.goal),
    generatePhoneNumbers(),
    generatePhoneNumbers({
      region: "FL",
      city: "Miami",
      count: 1
    }),
  ]);

  // First create the parent campaign
  const { data: parentCampaign, error: parentError } = await supabase
    .from('campaigns')
    .insert([{
      name: campaign.name,
      goal: campaign.goal,
      owner: user.id,
      status: 'Active',
      start_date: new Date().toISOString().split('T')[0],
      configuration,
      phone_numbers: phoneNumbers
    }])
    .select()
    .single();

  if (parentError) throw parentError;

  // Then create the test campaign linked to the parent
  const { data: testCampaign, error: testError } = await supabase
    .from('campaigns')
    .insert([{
      name: campaign.name,
      goal: campaign.goal,
      owner: user.id,
      status: 'Active',
      start_date: new Date().toISOString().split('T')[0],
      configuration,
      phone_numbers: testPhoneNumber,
      parent_campaign: parentCampaign.campaign_id // Link to parent campaign
    }])
    .select()
    .single();

  if (testError) throw testError;

  // Update parent campaign with child reference
  const { error: updateError } = await supabase
    .from('campaigns')
    .update({ child_campaign: testCampaign.campaign_id })
    .eq('campaign_id', parentCampaign.campaign_id);

  if (updateError) throw updateError;

  return parentCampaign;
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

  // First get all campaigns where user is a member
  const { data: memberCampaigns, error: memberError } = await supabase
    .from('campaign_members')
    .select('campaign_id')
    .eq('user_id', user.id);

  if (memberError) throw memberError;

  // If user is a member of any campaigns, include those in the query
  const campaignIds = memberCampaigns?.map(c => c.campaign_id) || [];
  
  if (campaignIds.length === 0) {
    // If user isn't a member of any campaigns, just get owned campaigns
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('owner', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get both owned campaigns and member campaigns
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .or(`owner.eq.${user.id},campaign_id.in.(${campaignIds.map(id => `"${id}"`).join(',')})`)
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
    .eq('campaign_id', campaignId);

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