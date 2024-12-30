import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { ContactHistory } from './contact-details/ContactHistory';

interface ContactStatusDetailsProps {
  contactId: string;
  onBack: () => void;
}

export function ContactStatusDetails({ contactId, onBack }: ContactStatusDetailsProps) {
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