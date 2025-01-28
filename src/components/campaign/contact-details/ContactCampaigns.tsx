import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { statusConfig } from '../../../utils/status';
import { useStatusHistory } from '../../../hooks/useStatusHistory';
import { getCampaignContactId } from '../../../services/contacts/campaign-contacts';
import type { Campaign } from '../../../types';

interface CampaignStatusProps {
  campaignId: string;
  contactId: string;
}

function CampaignStatus({ campaignId, contactId }: CampaignStatusProps) {
  const [campaignContactId, setCampaignContactId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<Error | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  // Only call useStatusHistory when we have a valid campaignContactId
  const { 
    history: statusHistory, 
    loading: statusLoading, 
    error: statusError 
  } = useStatusHistory(campaignContactId);

  useEffect(() => {
    let mounted = true;

    async function fetchCampaignContactId() {
      setIsFetching(true);
      setFetchError(null);
      
      try {
        console.log('[CampaignStatus] Fetching campaign contact ID:', { campaignId, contactId });
        const id = await getCampaignContactId(campaignId, contactId);
        
        // Only update state if component is still mounted
        if (mounted) {
          console.log('[CampaignStatus] Got campaign contact ID:', id);
          setCampaignContactId(id);
        }
      } catch (err) {
        if (mounted) {
          console.error('[CampaignStatus] Error fetching campaign contact ID:', err);
          setFetchError(err instanceof Error ? err : new Error('Failed to fetch campaign contact ID'));
        }
      } finally {
        if (mounted) {
          setIsFetching(false);
        }
      }
    }

    fetchCampaignContactId();

    // Cleanup function to prevent setting state on unmounted component
    return () => {
      mounted = false;
    };
  }, [campaignId, contactId]);

  // Show loading state while either fetching the ID or loading status history
  if (isFetching || (campaignContactId && statusLoading)) {
    return <div className="animate-pulse h-6 w-20 bg-gray-200 dark:bg-dark-200 rounded"></div>;
  }

  // Show default state if there's an error or no status history
  if (fetchError || statusError || !campaignContactId || !statusHistory.length) {
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.awaiting_contact.color}`}>
        {statusConfig.awaiting_contact.label}
      </span>
    );
  }

  const latestStatus = statusHistory[0];
  const statusDetails = statusConfig[latestStatus.contact_status as keyof typeof statusConfig];

  return (
    <div className="flex flex-col items-end gap-1">
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusDetails?.color}`}>
        {statusDetails?.label}
      </span>
      <span className="text-xs text-gray-500 dark:text-dark-400">
        {formatDistanceToNow(new Date(latestStatus.created_at), { addSuffix: true })}
      </span>
    </div>
  );
}

interface ContactCampaignsProps {
  campaigns: Campaign[];
  contactId: string;
}

export function ContactCampaigns({ campaigns, contactId }: ContactCampaignsProps) {
  return (
    <div className="bg-white dark:bg-dark-50 rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-200">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-600">
          Active Campaigns
        </h3>
      </div>

      <div className="p-6">
        {campaigns.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-dark-400">No active campaigns</p>
        ) : (
          <div className="space-y-2">
            {campaigns.map((campaign) => (
              <div 
                key={campaign.campaign_id}
                className="px-6 py-4 dark:bg-dark-100 rounded-lg"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-dark-600 truncate">
                        {campaign.name}
                      </h4>
                      <div className={`
                        px-2 py-0.5 text-xs font-medium rounded-full
                        ${campaign.parent_campaign 
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                        }
                      `}>
                        {campaign.parent_campaign ? 'Test' : 'Live'}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-dark-400 line-clamp-2">
                      {campaign.goal}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <CampaignStatus campaignId={campaign.campaign_id} contactId={contactId} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}