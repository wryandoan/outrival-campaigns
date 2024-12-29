import React, { useState, useEffect } from 'react';
import { useContacts } from './contacts/useContacts';
import { ContactsTableActions } from './contacts/ContactsTableActions';
import { ContactsTableContent } from './contacts/ContactsTableContent';
import { ImportModal } from './contacts/ImportModal';
import { ContactStatusDetails } from './ContactStatusDetails';
import { ContactRemovalUploader } from './contacts/ContactRemovalUploader';
import { removeContactsFromCampaign, removeContactsByPhoneNumbers } from '../../services/contacts/remove';
import type { CampaignContact } from '../../services/contacts/types';
import type { ImportResult } from '../../types/import';

interface ContactsTableProps {
  campaignId: string;
  refreshTrigger: number;
  onSelectContact: (contact: CampaignContact) => void;
  uploadComponent: React.ReactNode;
}

export function ContactsTable({ 
  campaignId, 
  refreshTrigger, 
  onSelectContact,
  uploadComponent 
}: ContactsTableProps) {
  const { contacts, loading, error, refresh } = useContacts(campaignId, refreshTrigger);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [showUploader, setShowUploader] = useState(false);
  const [showRemovalUploader, setShowRemovalUploader] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<{ status: string; contactId: string } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Reset states when campaign changes
  useEffect(() => {
    setSelectedContacts(new Set());
    setShowUploader(false);
    setShowRemovalUploader(false);
    setSelectedStatus(null);
  }, [campaignId]);

  const handleSelectAll = (checked: boolean) => {
    setSelectedContacts(checked ? new Set(contacts.map(c => c.contact_id)) : new Set());
  };

  const handleSelectContact = (contactId: string, checked: boolean) => {
    const newSelected = new Set(selectedContacts);
    if (checked) {
      newSelected.add(contactId);
    } else {
      newSelected.delete(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleCallSelected = async () => {
    // TODO: Implement call functionality
    console.log('Calling selected contacts:', Array.from(selectedContacts));
  };

  const handleRemoveSelected = async () => {
    if (selectedContacts.size === 0) {
      setShowRemovalUploader(true);
      return;
    }
    
    try {
      setIsRemoving(true);
      const result = await removeContactsFromCampaign(
        campaignId,
        Array.from(selectedContacts)
      );
      
      console.log(`Removed ${result.removedFromCampaign} contacts from campaign`);
      if (result.deletedContacts > 0) {
        console.log(`Deleted ${result.deletedContacts} contacts from system`);
      }
      
      // Clear selection and refresh the list
      setSelectedContacts(new Set());
      refresh();
    } catch (err) {
      console.error('Failed to remove contacts:', err);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleRemovalUpload = async (result: ImportResult) => {
    try {
      setIsRemoving(true);
      
      if (result.removeOthers && result.toRemoveIfEnabled) {
        // Remove contacts not in the CSV
        const contactIdsToRemove = result.toRemoveIfEnabled.map(c => c.contact_id);
        if (contactIdsToRemove.length > 0) {
          await removeContactsFromCampaign(campaignId, contactIdsToRemove);
        }
      } else {
        // Remove contacts from the CSV
        const phoneNumbers = result.contacts.map(c => c.phone_number);
        await removeContactsByPhoneNumbers(campaignId, phoneNumbers);
      }
      
      setShowRemovalUploader(false);
      refresh();
    } catch (err) {
      console.error('Failed to remove contacts:', err);
    } finally {
      setIsRemoving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-600 dark:text-dark-600">Loading contacts...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
        <p className="text-red-800 dark:text-red-200">{error}</p>
      </div>
    );
  }

  if (selectedStatus) {
    return (
      <ContactStatusDetails
        contactId={selectedStatus.contactId}
        onBack={() => setSelectedStatus(null)}
      />
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-50 rounded-lg shadow-sm p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-600 mb-2">
            No contacts added yet
          </h3>
          <p className="text-gray-600 dark:text-dark-400 mb-6">
            Upload a CSV file to add contacts to your campaign
          </p>
          {uploadComponent}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <ContactsTableActions
        selectedCount={selectedContacts.size}
        onCallSelected={handleCallSelected}
        onRemoveSelected={handleRemoveSelected}
        onImport={() => setShowUploader(true)}
        isRemoving={isRemoving}
      />

      <div className="flex-1 overflow-hidden rounded-lg">
        <ContactsTableContent
          contacts={contacts}
          selectedContacts={selectedContacts}
          onSelectAll={handleSelectAll}
          onSelectContact={handleSelectContact}
          onContactClick={onSelectContact}
          onStatusClick={(status, contactId) => setSelectedStatus({ status, contactId })}
        />
      </div>

      {showUploader && (
        <ImportModal onClose={() => setShowUploader(false)} title="Import Contacts To Add">
          {React.cloneElement(uploadComponent as React.ReactElement, {
            onSuccess: (result: ImportResult) => {
              setShowUploader(false);
              if ((uploadComponent as React.ReactElement).props.onSuccess) {
                (uploadComponent as React.ReactElement).props.onSuccess(result);
              }
            }
          })}
        </ImportModal>
      )}

      {showRemovalUploader && (
        <ImportModal onClose={() => setShowRemovalUploader(false)} title="Import Contacts To Remove">
          <ContactRemovalUploader
            campaignId={campaignId}
            onError={(error) => console.error(error)}
            onSuccess={handleRemovalUpload}
          />
        </ImportModal>
      )}
    </div>
  );
}