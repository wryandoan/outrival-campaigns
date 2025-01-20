import { supabase } from '../../lib/supabase/client';
import { generateInviteToken } from '../invitations';
import { sendInvitationEmail } from '../email';

export type CampaignMemberRole = 'viewer' | 'editor' | 'admin';

export interface CampaignMember {
  id: string;
  campaign_id: string;
  user_id: string;
  role: CampaignMemberRole;
  invited_by: string;
  created_at: string;
  user_email?: string;
}

export interface PendingInvitation {
  id: string;
  campaign_id: string;
  email: string;
  role: CampaignMemberRole;
  invited_by: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export async function getUserRole(campaignId: string): Promise<CampaignMemberRole | 'owner' | null> {
  // First check if user is the owner
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('owner')
    .eq('campaign_id', campaignId)
    .single();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  if (campaign?.owner === user.id) {
    return 'owner';
  }

  // If not owner, check member role
  const { data: member } = await supabase
    .from('campaign_members')
    .select('role')
    .eq('campaign_id', campaignId)
    .eq('user_id', user.id)
    .single();

  return member?.role || null;
}

export async function getCampaignMembers(campaignId: string): Promise<CampaignMember[]> {
  // First get the campaign owner
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('owner')
    .eq('campaign_id', campaignId)
    .single();

  if (campaignError) {
    console.error('Error fetching campaign:', campaignError);
    throw campaignError;
  }

  // Get owner's email
  const { data: ownerEmail } = await supabase
    .from('user_emails')
    .select('email')
    .eq('user_id', campaign.owner)
    .single();

  // Get all regular members
  const { data: members, error: membersError } = await supabase
    .from('campaign_members')
    .select(`
      id,
      campaign_id,
      user_id,
      role,
      invited_by,
      created_at
    `)
    .eq('campaign_id', campaignId);

  if (membersError) {
    console.error('Error fetching members:', membersError);
    throw membersError;
  }

  // Get emails for all members
  const memberUserIds = members?.map(m => m.user_id) || [];
  const { data: memberEmails, error: emailsError } = await supabase
    .from('user_emails')
    .select('user_id, email')
    .in('user_id', memberUserIds);

  if (emailsError) {
    console.error('Error fetching member emails:', emailsError);
    throw emailsError;
  }

  // Create a map of user_id to email
  const emailMap = new Map(memberEmails?.map(e => [e.user_id, e.email]));

  // Combine owner and members
  const allMembers: CampaignMember[] = [
    // Add owner as first member
    {
      id: `owner-${campaign.owner}`,
      campaign_id: campaignId,
      user_id: campaign.owner,
      role: 'owner' as CampaignMemberRole,
      invited_by: campaign.owner,
      created_at: new Date().toISOString(),
      user_email: ownerEmail?.email
    },
    // Add regular members
    ...(members?.map(member => ({
      ...member,
      user_email: emailMap.get(member.user_id)
    })) || [])
  ];

  return allMembers;
}

export async function getPendingInvitations(campaignId: string): Promise<PendingInvitation[]> {
  const { data, error } = await supabase
    .from('pending_invitations')
    .select('*')
    .eq('campaign_id', campaignId)
    .gt('expires_at', new Date().toISOString());

  if (error) {
    console.error('Error fetching pending invitations:', error);
    throw error;
  }

  return data || [];
}

export async function inviteMemberToCampaign(
  campaignId: string,
  email: string,
  role: CampaignMemberRole
): Promise<CampaignMember | PendingInvitation> {
  // First check if user exists
  const { data: users } = await supabase
    .from('user_emails')
    .select('user_id')
    .eq('email', email)
    .maybeSingle();

  // Get campaign name for the email
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('name')
    .eq('campaign_id', campaignId)
    .single();

  // Get inviter's email
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  if (!currentUser) throw new Error('Not authenticated');

  const { data: inviterEmail } = await supabase
    .from('user_emails')
    .select('email')
    .eq('user_id', currentUser.id)
    .single();

  // If user exists, add them as a member
  if (users?.user_id) {
    const { data, error } = await supabase
      .from('campaign_members')
      .insert({
        campaign_id: campaignId,
        user_id: users.user_id,
        role,
        invited_by: currentUser.id
      })
      .select('*')
      .single();

    if (error) throw error;

    // Try to send email notification but don't block on failure
    try {
      await sendInvitationEmail(
        email,
        '', // No token needed for existing users
        campaign.name,
        inviterEmail.email
      );
    } catch (emailError) {
      console.warn('Failed to send notification email:', emailError);
      // Continue anyway since the member was added successfully
    }

    return data;
  }

  // For new users, create an invitation
  const token = generateInviteToken();
  
  const { data: invitation, error: inviteError } = await supabase
    .from('pending_invitations')
    .insert({
      campaign_id: campaignId,
      email,
      role,
      invited_by: currentUser.id,
      token
    })
    .select()
    .single();

  if (inviteError) throw inviteError;

  // Try to send the invitation email
  try {
    await sendInvitationEmail(
      email,
      token,
      campaign.name,
      inviterEmail.email
    );
    return invitation;
  } catch (emailError) {
    console.warn('Failed to send invitation email:', emailError);
    // Return the invitation even if email fails
    return invitation;
  }
}

export async function updateMemberRole(
  memberId: string,
  role: CampaignMemberRole
): Promise<void> {
  const { error } = await supabase
    .from('campaign_members')
    .update({ role })
    .eq('id', memberId);

  if (error) throw error;
}

export async function removeMember(memberId: string): Promise<void> {
  const { error } = await supabase
    .from('campaign_members')
    .delete()
    .eq('id', memberId);

  if (error) throw error;
}

export async function removePendingInvitation(inviteId: string): Promise<void> {
  const { error } = await supabase
    .from('pending_invitations')
    .delete()
    .eq('id', inviteId);

  if (error) throw error;
}