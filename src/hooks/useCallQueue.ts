import { useState } from 'react';
import { initiateOutboundCall } from '../services/calls';
import type { CampaignContact } from '../services/contacts/types';

interface UseCallQueueProps {
  onContactUpdate?: (updatedContacts: CampaignContact[]) => void;
}

export function useCallQueue({ onContactUpdate }: UseCallQueueProps = {}) {
  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiateCall = async (contacts: CampaignContact[]) => {
    if (isCallInProgress || !contacts.length) {
      console.log('Call in progress or no contacts provided');
      return;
    }

    setError(null);
    console.log('Starting call for contacts:', contacts);

    try {
      setIsCallInProgress(true);
      const contact = contacts[0];
      console.log('Initiating call for contact:', contact);
      
      const result = await initiateOutboundCall(contact.id, contact.phone_number);
      console.log('Call initiated successfully:', result);

      // If there's an update handler, call it with the updated contacts
      if (onContactUpdate && result.updatedContacts) {
        onContactUpdate(result.updatedContacts);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate call';
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