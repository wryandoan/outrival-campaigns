import React from 'react';
import { useCampaignContact } from '../../../hooks/useCampaignContact';
import { FollowUpInfo } from './FollowUpInfo';

interface FollowUpDetailsProps {
  campaignContactId: string;
}

export default function FollowUpDetails({ campaignContactId }: FollowUpDetailsProps) {
  const { details, loading, error } = useCampaignContact(campaignContactId);

  if (loading) {
    return <div className="mt-2 text-sm text-gray-500">Loading follow-up details...</div>;
  }

  if (error || !details) {
    return null;
  }

  return (
    <div className="mt-2">
      <FollowUpInfo details={details} />
    </div>
  );
}