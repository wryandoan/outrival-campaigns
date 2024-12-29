import React, { useEffect, useState } from 'react';
import { useStatusHistory } from '../../../hooks/useStatusHistory';
import { statusConfig } from '../../../utils/status';
import { getCampaignContactId } from '../../../services/contacts/campaign-contacts';
import { formatDistanceToNow } from 'date-fns';
import type { Campaign } from '../../../types';

interface ContactCampaignsProps {
  campaigns: Campaign[];
  contactId: string;
}

function CampaignStatus({ campaignId, contactId }: { campaignId: string; contactId: string }) {
  const [campaignContactId, setCampaignContactId] = useState<string | null>(null);
  const { history, loading: historyLoading, error: historyError } = useStatusHistory(campaignContactId || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCampaignContactId() {
      try {
        const id = await getCampaignContactId(campaignId, contactId);
        setCampaignContactId(id);
      } catch (err) {
        console.error('Error fetching campaign contact ID:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCampaignContactId();
  }, [campaignId, contactId]);

  if (loading || historyLoading) {
    return <div className="animate-pulse h-6 w-20 bg-gray-200 dark:bg-dark-200 rounded"></div>;
  }

  if (historyError || !history.length || !campaignContactId) {
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.awaiting_contact.color}`}>
        {statusConfig.awaiting_contact.label}
      </span>
    );
  }

  const latestStatus = history[0];
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
                    <h4 className="text-sm font-medium text-gray-900 dark:text-dark-600 truncate">
                      {campaign.name}
                    </h4>
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