import React, { useState } from 'react';
import type { CampaignMemberRole } from '../../../services/campaigns/members';

interface MemberInviteFormProps {
  onInvite: (email: string, role: CampaignMemberRole) => Promise<void>;
  isInviting: boolean;
}

export function MemberInviteForm({ onInvite, isInviting }: MemberInviteFormProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CampaignMemberRole>('viewer');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !role) return;
    await onInvite(email, role);
    setEmail('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          className="flex-1 rounded-lg border border-gray-300 dark:border-dark-300 bg-white dark:bg-dark-50 px-4 py-2 text-gray-900 dark:text-dark-600"
          required
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as CampaignMemberRole)}
          className="rounded-lg border border-gray-300 dark:border-dark-300 bg-white dark:bg-dark-50 px-4 py-2 text-gray-900 dark:text-dark-600"
        >
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          disabled={isInviting}
          className="px-4 py-2 bg-dark-100 hover:bg-dark-200 dark:bg-dark-100 dark:hover:bg-dark-400 text-dark-600 rounded-lg transition-colors disabled:opacity-50"
        >
          {isInviting ? 'Inviting...' : 'Invite'}
        </button>
      </div>
    </form>
  );
}