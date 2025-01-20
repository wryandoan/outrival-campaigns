import React from 'react';
import { Users, Trash2 } from 'lucide-react';
import type { CampaignMember, CampaignMemberRole } from '../../../services/campaigns/members';

interface MemberCardProps {
  member: CampaignMember;
  canManageMembers: boolean;
  onRoleChange: (memberId: string, role: CampaignMemberRole) => void;
  onRemove: (memberId: string) => void;
}

export function MemberCard({ member, canManageMembers, onRoleChange, onRemove }: MemberCardProps) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-dark-100 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-gray-400 dark:text-dark-400" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-dark-600">
              {member.user_email}
            </p>
            <p className="text-sm text-gray-500 dark:text-dark-400">
              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
            </p>
          </div>
        </div>

        {canManageMembers && (
          <div className="flex items-center gap-3">
            <select
              value={member.role}
              onChange={(e) => onRoleChange(member.id, e.target.value as CampaignMemberRole)}
              className="rounded-lg border border-gray-300 dark:border-dark-300 bg-white dark:bg-dark-50 px-3 py-1 text-sm text-gray-900 dark:text-dark-600"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
            <button
              onClick={() => onRemove(member.id)}
              className="p-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}