import React from 'react';
import { ContactsTableHeader } from '../ContactsTableHeader';
import { ContactsTableRow } from '../ContactsTableRow';
import type { CampaignContact } from '../../../services/contacts/types';

interface ContactsTableContentProps {
  contacts: CampaignContact[];
  selectedContacts: Set<string>;
  onSelectContact: (contactId: string, checked: boolean) => void;
  onContactClick: (contact: CampaignContact) => void;
  onStatusClick: (status: string, contactId: string) => void;
  canEdit: boolean;
}

export function ContactsTableContent({
  contacts,
  selectedContacts,
  onSelectContact,
  onContactClick,
  onStatusClick,
  canEdit
}: ContactsTableContentProps) {
  console.log('[ContactsTableContent] Rendering with contacts:', contacts.map(c => ({
    id: c.campaign_user_id,
    name: `${c.first_name} ${c.last_name}`,
    status: c.contact_status
  })));

  const handleStatusClick = (status: string, contactId: string) => {
    console.log('[ContactsTableContent] Status clicked:', { status, contactId });
    onStatusClick(status, contactId);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-dark-50">
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-dark-100">
        <table className="min-w-full">
          <ContactsTableHeader canEdit={canEdit} />
        </table>
      </div>
      <div className="flex-1 overflow-y-auto">
        <table className="min-w-full">
          <tbody>
            {contacts.map((contact) => {
              console.log('[ContactsTableContent] Rendering row for contact:', {
                id: contact.campaign_user_id,
                name: `${contact.first_name} ${contact.last_name}`,
                status: contact.contact_status
              });
              
              return (
                <ContactsTableRow
                  key={contact.campaign_user_id}
                  contact={contact}
                  selected={selectedContacts.has(contact.campaign_user_id)}
                  onSelect={(checked) => onSelectContact(contact.campaign_user_id, checked)}
                  onClick={() => onContactClick(contact)}
                  onStatusClick={handleStatusClick}
                  canEdit={canEdit}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}