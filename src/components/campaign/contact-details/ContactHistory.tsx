import React from 'react';
import { useStatusHistory } from '../../../hooks/useStatusHistory';
import { useInteractionHistory } from '../../../hooks/useInteractionHistory';
import { InteractionCard } from './InteractionCard';
import { StatusHistoryCard } from './StatusHistoryCard';
import { Loader2 } from 'lucide-react';

interface ContactHistoryProps {
  contactId: string;
}

export function ContactHistory({ contactId }: ContactHistoryProps) {
  const { history: statusHistory, loading: statusLoading, error: statusError } = useStatusHistory(contactId);
  const { history: interactionHistory, loading: interactionLoading, error: interactionError } = useInteractionHistory(contactId);

  if (statusLoading || interactionLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (statusError || interactionError) {
    return (
      <div className="text-red-600 dark:text-red-400 p-4">
        {statusError || interactionError}
      </div>
    );
  }

  // Combine and sort both histories by date (ascending - oldest first)
  const combinedHistory = [
    ...statusHistory.map(entry => ({ type: 'status' as const, date: entry.created_at, data: entry })),
    ...interactionHistory.map(entry => ({ type: 'interaction' as const, date: entry.sent_date_time, data: entry }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-8">
      {combinedHistory.map((entry, index) => (
        <div key={index}>
          {entry.type === 'status' ? (
            <StatusHistoryCard entry={entry.data} />
          ) : (
            <InteractionCard interaction={entry.data} />
          )}
        </div>
      ))}
    </div>
  );
}