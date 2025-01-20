import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import { 
  inviteMemberToCampaign, 
  updateMemberRole, 
  removeMember,
  removePendingInvitation,
  getPendingInvitations,
  type CampaignMember,
  type CampaignMemberRole,
  type PendingInvitation
} from '../../services/campaigns/members';
import { MemberInviteForm } from './members/MemberInviteForm';
import { CampaignOwner } from './members/CampaignOwner';
import { MemberCard } from './members/MemberCard';
import { PendingInvitations } from './members/PendingInvitations';
import { supabase } from '../../lib/supabase/client';

interface CampaignMembersProps {
  campaignId: string;
  members: CampaignMember[];
  userRole: CampaignMemberRole | 'owner' | null;
  onMemberUpdate: () => void;
}

export function CampaignMembers({ campaignId, members, userRole, onMemberUpdate }: CampaignMembersProps) {
  const [error, setError] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<PendingInvitation[]>([]);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);

  const canManageMembers = userRole === 'owner' || userRole === 'admin';
  
  // Find the owner member
  const ownerMember = members.find(m => m.role === 'owner');
  // Get regular members (excluding owner)
  const regularMembers = members.filter(m => m.role !== 'owner');

  useEffect(() => {
    if (canManageMembers) {
      loadPendingInvites();
    }
  }, [canManageMembers, campaignId]);

  const loadPendingInvites = async () => {
    try {
      const invites = await getPendingInvitations(campaignId);
      setPendingInvites(invites);
    } catch (err) {
      console.error('Failed to load pending invites:', err);
    }
  };

  const handleInvite = async (email: string, role: CampaignMemberRole) => {
    try {
      setIsInviting(true);
      setError(null);
      const result = await inviteMemberToCampaign(campaignId, email, role);
      
      if ('emailError' in result) {
        // Email failed but we have an invite link
        const inviteUrl = `${window.location.origin}?invite=${result.token}`;
        await navigator.clipboard.writeText(inviteUrl);
        await loadPendingInvites();
      } else {
        // It's either a direct member addition or pending invitation
        onMemberUpdate();
        await loadPendingInvites();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite member');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: CampaignMemberRole) => {
    try {
      await updateMemberRole(memberId, newRole);
      onMemberUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    }
  };

  const handleRemove = async (memberId: string) => {
    try {
      // Get current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await removeMember(memberId);
      
      // If the user removed themselves, reload the page
      const currentMember = members.find(m => m.id === memberId);
      if (currentMember?.user_id === user.id) {
        window.location.href = '/';
        return;
      }
      
      onMemberUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    }
  };

  const handleCopyInviteLink = async (invite: PendingInvitation) => {
    try {
      const inviteUrl = `${window.location.origin}?invite=${invite.token}`;
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedInviteId(invite.id);
      setTimeout(() => setCopiedInviteId(null), 2000);
    } catch (err) {
      setError('Failed to copy invite link');
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await removePendingInvitation(inviteId);
      await loadPendingInvites();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel invitation');
    }
  };

  return (
    <div className="bg-white dark:bg-dark-50 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-600">
          Campaign Members
        </h3>
        
        {canManageMembers && (
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-gray-400 dark:text-dark-400" />
            <span className="text-sm text-gray-500 dark:text-dark-400">
              Invite members to collaborate
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {canManageMembers && (
        <MemberInviteForm onInvite={handleInvite} isInviting={isInviting} />
      )}

      <div className="space-y-4">
        {/* Always show owner card if owner exists */}
        {ownerMember && (
          <CampaignOwner email={ownerMember.user_email || 'Unknown'} />
        )}

        {/* Show regular members */}
        {regularMembers.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            canManageMembers={canManageMembers}
            onRoleChange={handleRoleChange}
            onRemove={handleRemove}
          />
        ))}

        <PendingInvitations
          invites={pendingInvites}
          copiedInviteId={copiedInviteId}
          canManageMembers={canManageMembers}
          onCopyLink={handleCopyInviteLink}
          onCancel={handleCancelInvite}
        />
      </div>
    </div>
  );
}