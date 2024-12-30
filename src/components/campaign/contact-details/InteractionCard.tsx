import React from 'react';
import { Phone, MessageSquare, Mail, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ConversationContent } from './ConversationContent';
import { RecordingPlayer } from '../../recordings/RecordingPlayer';
import { useContactName } from '../../../hooks/useContactName';
import type { Interaction } from '../../../services/interactions/types';

interface InteractionCardProps {
  interaction: Interaction;
}

export function InteractionCard({ interaction }: InteractionCardProps) {
  const { contactName } = useContactName(interaction.campaign_contact_id);

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

  const getStatusColor = () => {
    switch (interaction.interaction_status) {
      case 'Completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      case 'Failed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
      default:
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
    }
  };

  const Icon = getIcon();
  
  // Parse notes to get room_id if available
  let roomId: string | null = null;
  if (interaction.notes) {
    try {
      const notes = JSON.parse(interaction.notes);
      roomId = notes.room_id;
    } catch (e) {
      console.error('Failed to parse interaction notes:', e);
    }
  }

  return (
    <div className="relative pl-8 pb-8 border-l-2 border-gray-200 dark:border-dark-200 last:border-0 last:pb-0">
      <div className="absolute -left-2 top-0">
        <div className={`w-4 h-4 rounded-full ${getStatusColor()} border-2 border-white dark:border-dark-50`} />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-400">
          <Clock className="w-4 h-4" />
          <span>{formatDistanceToNow(new Date(interaction.sent_date_time), { addSuffix: true })}</span>
        </div>

        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-400 dark:text-dark-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-dark-600">
            {interaction.type === 'outbound' ? 'Outbound' : 'Inbound'} {interaction.communication_type}
          </span>
        </div>

        {interaction.interaction_disposition && (
          <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}>
            {interaction.interaction_disposition.replace(/_/g, ' ')}
          </div>
        )}

        {roomId && (
          <div className="mt-2">
            <RecordingPlayer 
              roomId={roomId} 
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
    </div>
  );
}