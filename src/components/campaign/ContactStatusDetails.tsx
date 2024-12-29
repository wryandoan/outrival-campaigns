import React from 'react';
import { ArrowLeft, Clock, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { statusConfig } from '../../utils/status';
import { useStatusHistory } from '../../hooks/useStatusHistory';

interface ContactStatusDetailsProps {
  status: string;
  contactId: string;
  onBack: () => void;
}

export function ContactStatusDetails({ status, contactId, onBack }: ContactStatusDetailsProps) {
  const { history, loading, error } = useStatusHistory(contactId);

  return (
    <div className="p-6">
      <Button variant="secondary" icon={ArrowLeft} onClick={onBack} className="mb-6">
        Back to Contacts
      </Button>

      <div className="bg-white dark:bg-dark-50 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-600 mb-6">
          Status History
        </h3>
        
        {loading ? (
          <div className="text-center py-4 text-gray-600 dark:text-dark-400">
            Loading status history...
          </div>
        ) : error ? (
          <div className="text-red-600 dark:text-red-400 p-4">
            {error}
          </div>
        ) : !history?.length ? (
          <div className="text-center py-4 text-gray-600 dark:text-dark-400">
            No status history available
          </div>
        ) : (
          <div className="space-y-8">
            {history.map((entry) => {
              const statusDetails = statusConfig[entry.contact_status as keyof typeof statusConfig];
              return (
                <div 
                  key={entry.history_id}
                  className="relative pl-8 pb-8 border-l-2 border-gray-200 dark:border-dark-200 last:border-0 last:pb-0"
                >
                  <div className="absolute -left-2 top-0">
                    <div className={`w-4 h-4 rounded-full ${statusDetails?.color || 'bg-gray-200 dark:bg-dark-200'} border-2 border-white dark:border-dark-50`} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-400">
                      <Clock className="w-4 h-4" />
                      <span>{formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}</span>
                    </div>
                    <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusDetails?.color || 'bg-gray-100 dark:bg-dark-100 text-gray-800 dark:text-dark-200'}`}>
                      {statusDetails?.label || entry.contact_status}
                    </div>
                    {entry.notes && (
                      <div className="flex items-start gap-2 mt-2 bg-gray-50 dark:bg-dark-100 p-3 rounded-lg">
                        <MessageSquare className="w-4 h-4 text-gray-400 dark:text-dark-400 mt-0.5" />
                        <p className="text-sm text-gray-600 dark:text-dark-400">
                          {entry.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}