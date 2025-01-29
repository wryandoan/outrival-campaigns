import React, { useState } from 'react';
import { Phone, Info, MessageSquare, Mail, Clock, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ConversationContent } from './ConversationContent';
import { RecordingPlayer } from '../../recordings/RecordingPlayer';
import { useContactName } from '../../../hooks/useContactName';
import { insightMap } from '../../../utils/insights';
import type { Interaction } from '../../../services/interactions/types';

interface InteractionCardProps {
  interaction: Interaction;
}

interface InteractionNotes {
  room_name?: string;
  notes?: string;
  error?: string;
}

export function InteractionCard({ interaction }: InteractionCardProps) {
  const { contactName } = useContactName(interaction.campaign_contact_id);
  const [isExpanded, setIsExpanded] = useState(false);

  const getIcon = () => {
    switch (interaction.communication_type) {
      case 'call':
        return Phone;
      case 'sms':
        return MessageSquare;
      case 'email':
        return Mail;
    }
  };

  const Icon = getIcon();
  
  // Parse notes to get structured data
  let parsedNotes: InteractionNotes = {};
  if (interaction.notes) {
    try {
      parsedNotes = JSON.parse(interaction.notes);
    } catch (e) {
      console.error('Failed to parse interaction notes:', e);
      // If parsing fails, treat the entire notes as a string message
      parsedNotes = { notes: interaction.notes };
    }
  }

  const hasExpandableContent = parsedNotes.room_name || interaction.content;

  return (
    <div className="relative pl-8 pb-8 border-l-2 border-gray-200 dark:border-dark-200 last:border-0 last:pb-0">
      <div className="absolute -left-2 top-0">
        <div className={`w-4 h-4 rounded-full ${
          interaction.interaction_status === 'Completed'
            ? 'bg-green-100 dark:bg-green-900/30'
            : interaction.interaction_status === 'Failed'
            ? 'bg-red-100 dark:bg-red-900/30'
            : 'bg-yellow-100 dark:bg-yellow-900/30'
        } border-2 border-white dark:border-dark-50`} />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-400">
          <Clock className="w-4 h-4" />
          <span>{formatDistanceToNow(new Date(interaction.sent_date_time), { addSuffix: true })}</span>
        </div>

        <div className="flex items-center justify-left">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-gray-400 dark:text-dark-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-dark-600">
                {interaction.type === 'outbound' ? 'Outbound' : 'Inbound'} {interaction.communication_type}
              </span>
            </div>

            {interaction.interaction_insight && (
              <div className={`shrink-0 inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                insightMap[interaction.interaction_insight as keyof typeof insightMap]?.color || 
                'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200'
              }`}>
                {insightMap[interaction.interaction_insight as keyof typeof insightMap]?.label || 
                 interaction.interaction_insight.replace(/_/g, ' ')}
              </div>
            )}
          </div>

          {hasExpandableContent && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2 p-1 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-full transition-colors"
            >
              <span className="text-sm text-gray-700 dark:text-dark-600 p-3 pr-0">
                {isExpanded ? "Hide Details" : "Show Details"}
              </span>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-dark-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500 dark:text-dark-400" />
              )}
            </button>
          )}
        </div>

        {/* Show error if present */}
        {parsedNotes.error && (
          <div className="flex items-start gap-2 mt-2 bg-gray-50 dark:bg-dark-100 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 text-gray-400 dark:text-dark-400 mt-0.5" />
            <p className="text-sm text-gray-600 dark:text-dark-400">
              {parsedNotes.error}
            </p>
          </div>
        )}

        {/* Show notes if present */}
        {parsedNotes.notes && (
          <div className="flex items-start gap-2 mt-2 bg-gray-50 dark:bg-dark-100 p-3 rounded-lg">
            <Info className="w-4 h-4 text-gray-400 dark:text-dark-400 mt-0.5" />
            <p className="text-sm text-gray-600 dark:text-dark-400">
              {parsedNotes.notes}
            </p>
          </div>
        )}

        {isExpanded && (
          <div className="space-y-3 pt-0">
            {parsedNotes.room_name && (
              <div className="mt-2">
                <RecordingPlayer 
                  roomName={parsedNotes.room_name} 
                  interactionId={interaction.interaction_id}
                />
              </div>
            )}

            {interaction.content && (
              <div className="bg-gray-50 dark:bg-dark-100 p-3 rounded-lg">
                <ConversationContent 
                  content={interaction.content} 
                  contactName={contactName}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
