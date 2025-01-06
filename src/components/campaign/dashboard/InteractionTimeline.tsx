import React from 'react';
import { useInteractionTimeline } from '../../../hooks/useInteractionTimeline';
import { Loader2 } from 'lucide-react';
import { InteractionCard } from '../contact-details/InteractionCard';

interface InteractionTimelineProps {
  campaignId: string;
}

export function InteractionTimeline({ campaignId }: InteractionTimelineProps) {
  const { timeline, loading, error } = useInteractionTimeline(campaignId);

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 dark:text-red-400 p-4">
        Failed to load interaction timeline
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-50 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-600 mb-6">
        Recent Interactions
      </h3>
      
      <div className="space-y-6">
        {timeline.map((interaction) => (
          <InteractionCard
            key={interaction.interaction_id}
            interaction={interaction}
          />
        ))}

        {timeline.length === 0 && (
          <p className="text-center text-gray-500 dark:text-dark-400">
            No interactions yet
          </p>
        )}
      </div>
    </div>
  );
}