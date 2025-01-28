import React, { useState } from 'react';
import { useContacts } from '../../hooks/useContacts';
import { ContactsTableActions } from './contacts/ContactsTableActions';
import { ContactsTableContent } from './contacts/ContactsTableContent';
import { ImportModal } from './contacts/ImportModal';
import { ContactStatusDetails } from './ContactStatusDetails';
import { ContactRemovalUploader } from './contacts/ContactRemovalUploader';
import { SearchBar } from './contacts/SearchBar';
import { StatusFilter } from './contacts/StatusFilter';
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { removeContactsFromCampaign, removeContactsByPhoneNumbers } from '../../services/contacts/remove';
import type { ImportResult } from '../../types/import';
import type { CampaignMemberRole } from '../../services/campaigns/members';
import type { CampaignContact } from '../../services/contacts/types';

interface ContactsTableProps {
  campaignId: string;
  refreshTrigger: number;
  onSelectContact: (contact: CampaignContact) => void;
  uploadComponent: React.ReactNode;
  userRole: CampaignMemberRole | 'owner' | null;
}

interface SelectedStatus {
  status: string;
  contactId: string;
}

export function ContactsTable({ 
  campaignId, 
  refreshTrigger, 
  onSelectContact,
  uploadComponent,
  userRole
}: ContactsTableProps) {
  console.log('[ContactsTable] Rendering:', { campaignId, refreshTrigger });

  const { 
    contacts, 
    loading, 
    error, 
    refresh, 
    isRefreshing,
    pagination,
    filters,
    updateFilters
  } = useContacts(campaignId, refreshTrigger);

  console.log('[ContactsTable] Contact data:', {
    contactsCount: contacts?.length,
    loading,
    error,
    pagination,
    filters
  });

  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [showUploader, setShowUploader] = useState(false);
  const [showRemovalUploader, setShowRemovalUploader] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<SelectedStatus | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Check if user has edit permissions
  const canEdit = userRole === 'owner' || userRole === 'editor' || userRole === 'admin';

  const handleStatusClick = (status: string, contactId: string) => {
    console.log('[ContactsTable] Status clicked, setting selected status:', { status, contactId });
    if (contactId) {
      setSelectedStatus({ status, contactId });
    } else {
      console.error('[ContactsTable] No contact ID provided for status click');
    }
  };

  const handleRemoveSelected = async () => {
    if (!canEdit) return;
    
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
    if (!canEdit) return;

    try {
      setIsRemoving(true);
      
      if (result.removeOthers && result.toRemoveIfEnabled) {
        const contactIdsToRemove = result.toRemoveIfEnabled.map(c => c.campaign_user_id);
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-dark-200 rounded w-48"></div>
          <div className="h-4 bg-gray-200 dark:bg-dark-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
        <p className="text-red-800 dark:text-red-200">{error}</p>
      </div>
    );
  }

  if (selectedStatus) {
    console.log('[ContactsTable] Rendering ContactStatusDetails with:', selectedStatus);
    return (
      <ContactStatusDetails
        contactId={selectedStatus.contactId}
        onBack={() => {
          console.log('[ContactsTable] Back clicked, clearing selected status');
          setSelectedStatus(null);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <ContactsTableActions
        selectedCount={selectedContacts.size}
        onRemoveSelected={handleRemoveSelected}
        onImport={() => setShowUploader(true)}
        isRemoving={isRemoving}
        canEdit={canEdit}
      />

      <div className="mb-4 flex items-center gap-4">
        <SearchBar 
          value={filters.search} 
          onChange={(value) => updateFilters({ search: value })} 
        />
        <StatusFilter 
          value={filters.status} 
          onChange={(value) => updateFilters({ status: value })}
          contacts={contacts}
        />
        <button
          onClick={refresh}
          disabled={isRefreshing}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-300 
            bg-white dark:bg-dark-50 text-gray-900 dark:text-dark-600 
            hover:bg-gray-50 dark:hover:bg-dark-100 disabled:opacity-50
            ${isRefreshing ? 'cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="flex-1 overflow-hidden rounded-lg bg-white dark:bg-dark-50 shadow-sm">
        <ContactsTableContent
          contacts={contacts}
          selectedContacts={selectedContacts}
          onSelectContact={(contactId, checked) => {
            if (canEdit) {
              const newSelected = new Set(selectedContacts);
              if (checked) {
                newSelected.add(contactId);
              } else {
                newSelected.delete(contactId);
              }
              setSelectedContacts(newSelected);
            }
          }}
          onContactClick={onSelectContact}
          onStatusClick={handleStatusClick}
          canEdit={canEdit}
        />

        {contacts.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-gray-500 dark:text-dark-400 mb-4">
              No contacts found
            </p>
            {canEdit && (
              <div className="max-w-sm">
                {uploadComponent}
              </div>
            )}
          </div>
        )}
      </div>

      {pagination && pagination.totalPages > 0 && (
        <div className="mt-4 flex items-center justify-between px-4 py-3 bg-white dark:bg-dark-50 border-t border-gray-200 dark:border-dark-200">
          <div className="flex items-center">
            <p className="text-sm text-gray-700 dark:text-dark-400">
              Showing{' '}
              <span className="font-medium">
                {((pagination.page - 1) * pagination.pageSize) + 1}
              </span>
              {' '}-{' '}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)}
              </span>
              {' '}of{' '}
              <span className="font-medium">{pagination.totalCount}</span>
              {' '}results
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.changePage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg border border-gray-300 dark:border-dark-300 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-700 dark:text-dark-400">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => pagination.changePage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-lg border border-gray-300 dark:border-dark-300 disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {showUploader && canEdit && (
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

      {showRemovalUploader && canEdit && (
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