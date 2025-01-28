import { useState, useMemo } from 'react';
import type { CampaignContact } from '../../../services/contacts/types';
import { ALL_CONTACT_STATUSES } from '../../../utils/status';

export function useContactFilters(contacts: CampaignContact[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredContacts = useMemo(() => {
    // Ensure contacts is an array
    if (!Array.isArray(contacts)) {
      return [];
    }

    return contacts.filter(contact => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone_number.includes(searchTerm);
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || contact.contact_status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [contacts, searchTerm, statusFilter]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredContacts
  };
}