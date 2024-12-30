import React, { useState, useCallback } from 'react';
import { useContacts } from '../../hooks/useContacts';
import { useCallQueue } from '../../hooks/useCallQueue';
import { ContactsTableActions } from './contacts/ContactsTableActions';
import { ContactsTableContent } from './contacts/ContactsTableContent';
import { ImportModal } from './contacts/ImportModal';
import { ContactStatusDetails } from './ContactStatusDetails';
import { ContactRemovalUploader } from './contacts/ContactRemovalUploader';
import { Search, Filter } from 'lucide-react';
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
  const { contacts, setContacts, loading, error, refresh } = useContacts(campaignId, refreshTrigger);
  const { initiateCall, isCallInProgress, error: callError } = useCallQueue({
    onContactUpdate: (updatedContacts) => {
      setContacts(prevContacts => {
        const updatedMap = new Map(updatedContacts.map(c => [c.id, c]));
        return prevContacts.map(contact => 
          updatedMap.has(contact.id) ? updatedMap.get(contact.id)! : contact
        );
      });
    }
  });

  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [showUploader, setShowUploader] = useState(false);
  const [showRemovalUploader, setShowRemovalUploader] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<{ status: string; contactId: string } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = searchTerm === '' || 
      `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone_number.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || contact.contact_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCallSelected = async () => {
    if (selectedContacts.size === 0) return;

    try {
      const selectedContactDetails = contacts.filter(
        contact => selectedContacts.has(contact.contact_id)
      );
      await initiateCall(selectedContactDetails);
      setSelectedContacts(new Set());
    } catch (err) {
      console.error('Failed to initiate calls:', err);
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedContacts.size === 0) {
      setShowRemovalUploader(true);
      return;
    }
    
    try {
      setIsRemoving(true);
      await removeContactsFromCampaign(campaignId, Array.from(selectedContacts));
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
        const contactIdsToRemove = result.toRemoveIfEnabled.map(c => c.contact_id);
        if (contactIdsToRemove.length > 0) {
          await removeContactsFromCampaign(campaignId, contactIdsToRemove);
        }
      } else {
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

  if (error || callError) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
        <p className="text-red-800 dark:text-red-200">{error || callError}</p>
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
        isCallInProgress={isCallInProgress}
      />

      <div className="mb-4 flex gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-dark-300 bg-white dark:bg-dark-50 text-gray-900 dark:text-dark-600 placeholder:text-dark-400"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-10 pr-8 py-2 rounded-lg border border-gray-300 dark:border-dark-300 bg-white dark:bg-dark-50 text-gray-900 dark:text-dark-600"
          >
            <option value="all">All Statuses</option>
            {Array.from(new Set(contacts.map(c => c.contact_status))).map(status => (
              <option key={status} value={status}>
                {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-lg">
        <ContactsTableContent
          contacts={filteredContacts}
          selectedContacts={selectedContacts}
          onSelectAll={(checked) => {
            setSelectedContacts(checked ? new Set(filteredContacts.map(c => c.contact_id)) : new Set());
          }}
          onSelectContact={(contactId, checked) => {
            const newSelected = new Set(selectedContacts);
            if (checked) {
              newSelected.add(contactId);
            } else {
              newSelected.delete(contactId);
            }
            setSelectedContacts(newSelected);
          }}
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