import React from 'react';
import { CalendarClock } from 'lucide-react';
import { format } from 'date-fns';
import type { CampaignContactDetails } from '../../../hooks/useCampaignContact';

interface FollowUpInfoProps {
  details: CampaignContactDetails;
}

export function FollowUpInfo({ details }: FollowUpInfoProps) {
  if (!details.next_follow_up_date_time && (!details.follow_up_action_item || details.follow_up_action_item === 'none')) {
    return null;
  }

  const actionItemText = {
    'call': 'call',
    'sms': 'SMS'
  }[details.follow_up_action_item || 'none'];

  const isReattempt = details.contact_status === 'awaiting_reattempt';
  const actionType = isReattempt ? 'Reattempt' : 'Follow-up';

  return (
    <div className="space-y-2">
      {details.next_follow_up_date_time && (
        <div className="flex items-center p-3 bg-gray-50 dark:bg-dark-100 rounded-lg">
          <CalendarClock className="w-4 h-4 text-gray-400 dark:text-dark-400 mr-2" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 dark:text-dark-600">
              {actionItemText ? `${actionType} ${actionItemText} scheduled for:` : `${actionType} scheduled for:`}
            </p>
            <p className="text-sm text-gray-600 dark:text-dark-400">
              {format(new Date(details.next_follow_up_date_time), 'PPp')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}