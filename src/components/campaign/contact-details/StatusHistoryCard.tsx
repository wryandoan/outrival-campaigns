import React, { useState } from 'react';
import { Clock, Info, ChevronDown, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { statusConfig } from '../../../utils/status';
import FollowUpDetails from './FollowUpDetails';
import type { StatusHistoryEntry } from '../../../services/contacts/status-history';

interface StatusHistoryCardProps {
  entry: StatusHistoryEntry;
}

export function StatusHistoryCard({ entry }: StatusHistoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusDetails = statusConfig[entry.contact_status as keyof typeof statusConfig];
  
  const isFollowUpStatus = entry.contact_status === 'awaiting_reattempt' || 
                          entry.contact_status === 'awaiting_followup';

  return (
    <div className="relative pl-8 pb-8 border-l-2 border-gray-200 dark:border-dark-200 last:border-0 last:pb-0">
      <div className="absolute -left-2 top-0">
        <div className={`w-4 h-4 rounded-full ${statusDetails?.color || 'bg-gray-200 dark:bg-dark-200'} border-2 border-white dark:border-dark-50`} />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-400">
          <Clock className="w-4 h-4" />
          <span>{formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}</span>
        </div>

        <div className="flex items-center justify-left">
          <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusDetails?.color || 'bg-gray-100 dark:bg-dark-100 text-gray-800 dark:text-dark-200'}`}>
            {statusDetails?.label || entry.contact_status}
          </div>

          {isFollowUpStatus && entry.notes && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex p-3 items-center gap-1 text-sm text-gray-500 dark:text-dark-600 hover:text-gray-700 dark:hover:text-dark-600"
            >
              <span>Show Details</span>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {isExpanded && isFollowUpStatus && entry.notes && (
          <FollowUpDetails notes={entry.notes} />
        )}

        {entry.notes && !isFollowUpStatus && (
          <div className="flex items-start gap-2 mt-2 bg-gray-50 dark:bg-dark-100 p-3 rounded-lg">
            <Info className="w-4 h-4 text-gray-400 dark:text-dark-400 mt-0.5" />
            <p className="text-sm text-gray-600 dark:text-dark-400">
              {entry.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}