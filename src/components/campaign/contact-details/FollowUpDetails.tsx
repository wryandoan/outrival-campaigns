import React from 'react';
import { FollowUpInfo } from './FollowUpInfo';

interface FollowUpDetailsProps {
  notes: string;
}

interface FollowUpData {
  followup_details: {
    type: 'call' | 'sms';
    time: string;
  };
}

export default function FollowUpDetails({ notes }: FollowUpDetailsProps) {
  try {
    const parsedNotes = JSON.parse(notes) as FollowUpData;
    if (!parsedNotes?.followup_details) {
      console.log('No follow-up details found in notes:', notes);
      return null;
    }

    return (
      <div className="mt-2">
        <FollowUpInfo followupDetails={parsedNotes.followup_details} />
      </div>
    );
  } catch (e) {
    console.error('Failed to parse follow-up details:', e, 'Notes:', notes);
    return null;
  }
}