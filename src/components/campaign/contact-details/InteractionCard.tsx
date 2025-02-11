import React, { useState } from 'react';
import { Phone, Info, MessageSquare, Mail, Clock, ChevronDown, ChevronRight, AlertCircle, Loader2, PhoneForwarded, Copy, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ConversationContent } from './ConversationContent';
import { RecordingPlayer } from '../../recordings/RecordingPlayer';
import { useContactName } from '../../../hooks/useContactName';
import { insightMap } from '../../../utils/insights';
import { getInteractionLogs } from '../../../services/interactions/logs';
import { LogViewer } from '../../interactions/LogViewer';
import type { Interaction } from '../../../services/interactions/types';
import type { LogEntry } from '../../../services/interactions/logs';

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
  const [logs, setLogs] = useState<LogEntry[] | null>(null);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [copiedMain, setCopiedMain] = useState(false);
  const [copiedTransfer, setCopiedTransfer] = useState(false);

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

  const hasExpandableContent = parsedNotes.room_name || interaction.content || 
    interaction.transfer_logs?.length > 0 || interaction.transfer_content;

  const handleExpand = async () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    // Load logs when expanding if not already loaded
    if (newExpandedState && !logs && !loadingLogs) {
      try {
        setLoadingLogs(true);
        const logData = await getInteractionLogs(interaction.interaction_id);
        setLogs(logData);
      } catch (err) {
        console.error('Failed to load logs:', err);
      } finally {
        setLoadingLogs(false);
      }
    }
  };

  const copyLogs = async (logs: LogEntry[], setCopied: (value: boolean) => void) => {
    try {
      const logsText = JSON.stringify(logs, null, 2);
      await navigator.clipboard.writeText(logsText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy logs:', err);
    }
  };

  const status = insightMap[interaction.interaction_insight as keyof typeof insightMap];

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

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-gray-400 dark:text-dark-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-dark-600">
                {interaction.type === 'outbound' ? 'Outbound' : 'Inbound'} {interaction.communication_type}
              </span>
            </div>

            {interaction.interaction_insight && (
              <div className={`shrink-0 inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                status?.color || 
                'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200'
              }`}>
                {status?.label || 
                 interaction.interaction_insight.replace(/_/g, ' ')}
              </div>
            )}
          </div>

          {hasExpandableContent && (
            <button
              onClick={handleExpand}
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
          <div className="space-y-4 mt-4">
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

            {/* Transfer Content Section */}
            {interaction.transfer_content && (
              <div className="bg-gray-50 dark:bg-dark-100 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <PhoneForwarded className="w-4 h-4 text-gray-400 dark:text-dark-400" />
                  <h4 className="text-sm font-medium text-gray-700 dark:text-dark-600">
                    Transfer Conversation
                  </h4>
                </div>
                <ConversationContent 
                  content={interaction.transfer_content} 
                  contactName={contactName}
                />
              </div>
            )}

            {/* Transfer Logs Section */}
            {interaction.transfer_logs && interaction.transfer_logs.length > 0 && (
              <div className="bg-gray-50 dark:bg-dark-100 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <PhoneForwarded className="w-4 h-4 text-gray-400 dark:text-dark-400" />
                    <h4 className="text-sm font-medium text-gray-700 dark:text-dark-600">
                      Transfer Logs
                    </h4>
                  </div>
                  <button
                    onClick={() => copyLogs(interaction.transfer_logs!, setCopiedTransfer)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-dark-200 rounded transition-colors"
                    title="Copy logs"
                  >
                    {copiedTransfer ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400 dark:text-dark-400" />
                    )}
                  </button>
                </div>
                <LogViewer logs={interaction.transfer_logs} />
              </div>
            )}

            {/* Main Interaction Logs Section */}
            <div className="bg-gray-50 dark:bg-dark-100 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-dark-600">
                  Interaction Logs
                </h4>
                {logs && (
                  <button
                    onClick={() => copyLogs(logs, setCopiedMain)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-dark-200 rounded transition-colors"
                    title="Copy logs"
                  >
                    {copiedMain ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400 dark:text-dark-400" />
                    )}
                  </button>
                )}
              </div>
              
              {loadingLogs ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400 dark:text-dark-400" />
                </div>
              ) : logs ? (
                <LogViewer logs={logs} />
              ) : (
                <div className="text-sm text-gray-500 dark:text-dark-400 text-center py-4">
                  Failed to load logs
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}