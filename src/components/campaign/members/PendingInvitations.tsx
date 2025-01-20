import React from 'react';
import { Clock, Copy, Check, Trash2 } from 'lucide-react';
import type { PendingInvitation } from '../../../services/campaigns/members';

interface PendingInvitationsProps {
  invites: PendingInvitation[];
  copiedInviteId: string | null;
  canManageMembers: boolean;
  onCopyLink: (invite: PendingInvitation) => void;
  onCancel: (inviteId: string) => void;
}

export function PendingInvitations({ 
  invites, 
  copiedInviteId, 
  canManageMembers,
  onCopyLink,
  onCancel 
}: PendingInvitationsProps) {
  if (invites.length === 0) return null;

  return (
    <div className="mt-6">
      <h4 className="text-sm font-medium text-gray-700 dark:text-dark-600 mb-3">
        Pending Invitations
      </h4>
      <div className="space-y-3">
        {invites.map((invite) => (
          <div key={invite.id} className="p-4 bg-gray-50 dark:bg-dark-100 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400 dark:text-dark-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-dark-600">
                    {invite.email}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-dark-400">
                    {invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}
                  </p>
                </div>
              </div>

              {canManageMembers && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onCopyLink(invite)}
                    className="p-2 text-gray-500 hover:text-gray-600 dark:text-dark-400 dark:hover:text-dark-500"
                  >
                    {copiedInviteId === invite.id ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => onCancel(invite.id)}
                    className="p-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}