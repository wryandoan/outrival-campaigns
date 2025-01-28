import { useState, useEffect, useCallback } from 'react';
import { getCampaignContacts } from '../services/contacts/campaign-contacts';
import type { CampaignContact } from '../services/contacts/types';

export function useContacts(campaignId: string, refreshTrigger: number) {
  const [contacts, setContacts] = useState<CampaignContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    status: 'all'
  });

  const loadContacts = useCallback(async (currentPage: number) => {
    console.log('[useContacts] Loading contacts:', { 
      campaignId, 
      currentPage,
      pageSize: pagination.pageSize,
      filters 
    });

    if (!campaignId) {
      console.log('[useContacts] No campaign ID provided, clearing contacts');
      setContacts([]);
      setLoading(false);
      return;
    }

    try {
      setIsRefreshing(true);
      console.log('[useContacts] Fetching contacts from API...');
      
      const response = await getCampaignContacts(
        campaignId, 
        currentPage, 
        pagination.pageSize,
        {
          // Only include search if it's 3 or more characters
          search: filters.search.length >= 3 ? filters.search : undefined,
          status: filters.status
        }
      );

      console.log('[useContacts] Received response:', response);
      
      setContacts(response.data || []);
      setPagination(prev => ({
        ...prev,
        page: response.meta.page,
        totalCount: response.meta.total_count,
        totalPages: response.meta.total_pages
      }));
      setError(null);

      console.log('[useContacts] Updated state:', {
        contactsCount: response.data?.length || 0,
        pagination: {
          page: response.meta.page,
          totalCount: response.meta.total_count,
          totalPages: response.meta.total_pages
        }
      });
    } catch (err) {
      console.error('[useContacts] Error loading contacts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
      setContacts([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [campaignId, pagination.pageSize, filters]);

  useEffect(() => {
    console.log('[useContacts] Effect triggered:', {
      campaignId,
      page: pagination.page,
      refreshTrigger,
      filters
    });
    
    // Only trigger search if search term is empty or at least 3 characters
    if (filters.search.length === 0 || filters.search.length >= 3) {
      loadContacts(pagination.page);
    }
  }, [loadContacts, pagination.page, refreshTrigger, filters]);

  const refresh = useCallback(() => {
    console.log('[useContacts] Refreshing contacts');
    setPagination(prev => ({ ...prev, page: 1 }));
    loadContacts(1);
  }, [loadContacts]);

  const changePage = useCallback((newPage: number) => {
    console.log('[useContacts] Changing page:', { 
      currentPage: pagination.page,
      newPage,
      totalPages: pagination.totalPages 
    });
    
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  }, [pagination.totalPages]);

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filters change
  }, []);

  return {
    contacts,
    loading,
    error,
    refresh,
    isRefreshing,
    pagination: {
      ...pagination,
      changePage
    },
    filters,
    updateFilters
  };
}