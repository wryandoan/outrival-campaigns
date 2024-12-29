import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { ErrorMessage } from '../ui/ErrorMessage';
import { ContactBasicInfo } from './contact-details/ContactBasicInfo';
import { ContactPreferences } from './contact-details/ContactPreferences';
import { ContactCampaigns } from './contact-details/ContactCampaigns';
import { getContactCampaigns } from '../../services/contacts/contact-campaigns';
import { getContactDetails } from '../../services/contacts/contact-details';
import type { Campaign } from '../../types';
import type { ContactDetails as ContactDetailsType } from '../../types/contact';

interface ContactDetailsProps {
  contact: { contact_id: string };
  onBack: () => void;
}

export function ContactDetails({ contact, onBack }: ContactDetailsProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [details, setDetails] = useState<ContactDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [campaignsData, contactData] = await Promise.all([
          getContactCampaigns(contact.contact_id),
          getContactDetails(contact.contact_id)
        ]);
        setCampaigns(campaignsData);
        setDetails(contactData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load contact data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [contact.contact_id]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-dark-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 dark:bg-dark-200 rounded"></div>
          <div className="h-48 bg-gray-200 dark:bg-dark-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="p-6">
        <Button variant="secondary" icon={ArrowLeft} onClick={onBack} className="mb-6">
          Back to Contacts
        </Button>
        <ErrorMessage message={error || 'Contact not found'} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Button variant="secondary" icon={ArrowLeft} onClick={onBack} className="mb-6">
        Back to Contacts
      </Button>

      <ErrorMessage message={error} />

      <div className="space-y-6">
        <ContactBasicInfo details={details} />
        <ContactPreferences details={details} />
        <ContactCampaigns 
          campaigns={campaigns} 
          contactId={contact.contact_id}
        />
      </div>
    </div>
  );
}