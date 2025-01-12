import { useState } from 'react';
import { initiateOutboundCall } from '../services/calls';
import type { CampaignContact } from '../services/contacts/types';

const BATCH_SIZE = 25; // Maximum concurrent calls

export function useCallQueue() {
  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processBatch = async (contacts: CampaignContact[]) => {
    return Promise.all(
      contacts.map(contact => 
        initiateOutboundCall(contact.id)
          .catch(err => {
            console.error(`Failed to call contact ${contact.id}:`, err);
            return null;
          })
      )
    );
  };

  const initiateCall = async (contacts: CampaignContact[]) => {
    if (isCallInProgress || !contacts.length) {
      console.log('Call in progress or no contacts provided');
      return;
    }

    if (contacts.length > 100) {
      setError('Maximum of 100 contacts can be called at once');
      return;
    }

    setError(null);
    setIsCallInProgress(true);

    try {
      const results = [];
      // Process contacts in batches
      for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
        const batch = contacts.slice(i, i + BATCH_SIZE);
        const batchResults = await processBatch(batch);
        results.push(...batchResults);
      }

      console.log('Call results:', results);
      return results.filter(Boolean); // Return successful calls only
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate calls';
      console.error('Call initiation failed:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsCallInProgress(false);
    }
  };

  return {
    initiateCall,
    isCallInProgress,
    error
  };
}