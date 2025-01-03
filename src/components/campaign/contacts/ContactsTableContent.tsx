import React from 'react';
import { ContactsTableHeader } from '../ContactsTableHeader';
import { ContactsTableRow } from '../ContactsTableRow';
import type { CampaignContact } from '../../../services/contacts/types';

interface ContactsTableContentProps {
  contacts: CampaignContact[];
  selectedContacts: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelectContact: (contactId: string, checked: boolean) => void;
  onContactClick: (contact: CampaignContact) => void;
  onStatusClick: (status: string, contactId: string) => void;
}

export function ContactsTableContent({
  contacts,
  selectedContacts,
  onSelectAll,
  onSelectContact,
  onContactClick,
  onStatusClick
}: ContactsTableContentProps) {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-dark-50">
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-dark-100">
        <table className="min-w-full">
          <ContactsTableHeader
            onSelectAll={onSelectAll}
            allSelected={selectedContacts.size === contacts.length}
            someSelected={selectedContacts.size > 0 && selectedContacts.size < contacts.length}
          />
        </table>
      </div>
      <div className="flex-1 overflow-y-auto">
        <table className="min-w-full">
          <tbody>
            {contacts.map((contact) => (
              <ContactsTableRow
                key={contact.id}
                contact={contact}
                selected={selectedContacts.has(contact.contact_id)}
                onSelect={(checked) => onSelectContact(contact.contact_id, checked)}
                onClick={() => onContactClick(contact)}
                onStatusClick={(status) => onStatusClick(status, contact.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}