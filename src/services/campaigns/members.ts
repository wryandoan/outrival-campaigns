import { supabase } from '../../lib/supabase/client';
import { API_BASE_URL } from '../api';
import { getAuthToken } from '../api';

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

export async function getCampaignMembers(campaignId: string): Promise<CampaignMember[]> {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/campaigns/${campaignId}/members`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get campaign members');
    }

    return response.json();
  } catch (error) {
    console.error('Error getting campaign members:', error);
    throw error;
  }
}

export async function getPendingInvitations(campaignId: string): Promise<PendingInvitation[]> {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/invitations/${campaignId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get pending invitations');
    }

    return response.json();
  } catch (error) {
    console.error('Error getting pending invitations:', error);
    throw error;
  }
}

export async function inviteMemberToCampaign(
  campaignId: string,
  email: string,
  role: CampaignMemberRole
): Promise<CampaignMember | PendingInvitation> {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/invitations/${campaignId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        email,
        role
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to invite member');
    }

    return response.json();
  } catch (error) {
    console.error('Error inviting member:', error);
    throw error;
  }
}

export async function updateMemberRole(
  memberId: string,
  role: CampaignMemberRole
): Promise<void> {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/members/${memberId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ role })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update member role');
    }
  } catch (error) {
    console.error('Error updating member role:', error);
    throw error;
  }
}

export async function removeMember(memberId: string): Promise<void> {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/members/${memberId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to remove member');
    }
  } catch (error) {
    console.error('Error removing member:', error);
    throw error;
  }
}

export async function removePendingInvitation(inviteId: string): Promise<void> {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/invitations/${inviteId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to remove invitation');
    }
  } catch (error) {
    console.error('Error removing invitation:', error);
    throw error;
  }
}

export async function getUserRole(campaignId: string): Promise<CampaignMemberRole | 'owner' | null> {
  try {
    const token = await getAuthToken();

    const response = await fetch(
      `${API_BASE_URL}/api/v1/campaigns/${campaignId}/role`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get user role');
    }

    return response.json();
  } catch (error) {
    console.error('Error getting user role:', error);
    throw error;
  }
}