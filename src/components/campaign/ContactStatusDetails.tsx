import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { ContactHistory } from './contact-details/ContactHistory';

interface ContactStatusDetailsProps {
  contactId: string;
  onBack: () => void;
}

export function ContactStatusDetails({ contactId, onBack }: ContactStatusDetailsProps) {
  console.log('[ContactStatusDetails] Rendering with contactId:', contactId);

  if (!contactId) {
    console.error('[ContactStatusDetails] No contact ID provided');
    return (
      <div className="p-6">
        <Button variant="secondary" icon={ArrowLeft} onClick={onBack} className="mb-6">
          Back to Contacts
        </Button>
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4">
          <p className="text-red-800 dark:text-red-200">Error: No contact ID provided</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Button variant="secondary" icon={ArrowLeft} onClick={onBack} className="mb-6">
        Back to Contacts
      </Button>

      <div className="bg-white dark:bg-dark-50 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-600 mb-6">
          Contact History
        </h3>
        
        <ContactHistory contactId={contactId} />
      </div>
    </div>
  );
}