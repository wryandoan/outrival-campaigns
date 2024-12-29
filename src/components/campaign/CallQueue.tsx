import React, { useState } from 'react';
import { Phone } from 'lucide-react';
import { Button } from '../ui/Button';
import { getUncontactedContacts, initiateCallBatch } from '../../services/contacts/call-queue';
import type { CampaignContact } from '../../services/contacts/types';

interface CallQueueProps {
  campaignId: string;
  onError: (error: string) => void;
}

export function CallQueue({ campaignId, onError }: CallQueueProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [callCount, setCallCount] = useState(5);

  const handleCallNext = async () => {
    try {
      setIsLoading(true);
      const contacts = await getUncontactedContacts(campaignId, callCount);
      
      if (contacts.length === 0) {
        onError('No uncontacted numbers available');
        return;
      }

      const results = await initiateCallBatch(campaignId, contacts);
      const failures = results.filter(r => !r.success);
      
      if (failures.length > 0) {
        onError(`Failed to initiate calls for ${failures.length} contacts`);
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to initiate calls');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-6 bg-white dark:bg-dark-50 rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <select
            value={callCount}
            onChange={(e) => setCallCount(Number(e.target.value))}
            className="rounded-lg border border-gray-300 dark:border-dark-300 bg-white dark:bg-dark-50 px-3 py-2 text-sm text-gray-900 dark:text-dark-600"
          >
            {[1, 5, 10, 25, 50].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
          <Button
            variant="primary"
            icon={Phone}
            onClick={handleCallNext}
            disabled={isLoading}
          >
            {isLoading ? 'Initiating Calls...' : 'Call Next Numbers'}
          </Button>
        </div>
      </div>
    </div>
  );
}