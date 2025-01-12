import React from 'react';
import { CalendarClock, PhoneOutgoing, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface FollowUpInfoProps {
  followupDetails: {
    type: 'call' | 'sms';
    time: string;
  };
}

export function FollowUpInfo({ followupDetails }: FollowUpInfoProps) {
  const Icon = followupDetails.type === 'call' ? PhoneOutgoing : MessageSquare;

  return (
    <div className="space-y-2">
      <div className="flex items-center p-3 bg-gray-50 dark:bg-dark-100 rounded-lg">
        <CalendarClock className="w-4 h-4 text-gray-400 dark:text-dark-400 mr-2" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-gray-400 dark:text-dark-400" />
            <p className="text-sm font-medium text-gray-700 dark:text-dark-600">
              {`Follow-up ${followupDetails.type} scheduled for:`}
            </p>
          </div>
          <p className="text-sm text-gray-600 dark:text-dark-400">
            {format(new Date(followupDetails.time), 'PPp')}
          </p>
        </div>
      </div>
    </div>
  );
}