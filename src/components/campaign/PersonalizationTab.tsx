import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { Campaign } from '../../types';
import type { CampaignContact } from '../../services/contacts/types';
import { getCampaignContacts } from '../../services/contacts/campaign-contacts';

interface PersonalizationTabProps {
  campaign: Campaign;
}

interface FieldStats {
  total: number;
  examples: string[];
  percentage: number;
}

export function PersonalizationTab({ campaign }: PersonalizationTabProps) {
  const [contacts, setContacts] = useState<CampaignContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadContacts() {
      try {
        const campaignContacts = await getCampaignContacts(campaign.campaign_id);
        setContacts(campaignContacts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load contacts');
      } finally {
        setLoading(false);
      }
    }
    loadContacts();
  }, [campaign.campaign_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-dark-600 mb-2">
          Error Loading Contacts
        </h3>
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      </div>
    );
  }

  // Calculate field statistics
  const fieldStats = new Map<string, FieldStats>();
  contacts.forEach(contact => {
    if (contact.personalization_fields) {
      Object.entries(contact.personalization_fields).forEach(([key, value]) => {
        if (!fieldStats.has(key)) {
          fieldStats.set(key, { total: 0, examples: [], percentage: 0 });
        }
        
        const stats = fieldStats.get(key)!;
        stats.total++;
        stats.percentage = (stats.total / contacts.length) * 100;
        
        if (value && stats.examples.length < 3 && !stats.examples.includes(value)) {
          stats.examples.push(value);
        }
      });
    }
  });

  const fields = Array.from(fieldStats.entries());

  if (fields.length === 0) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-8 h-8 text-gray-400 dark:text-dark-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-dark-600 mb-2">
          No Personalization Fields
        </h3>
        <p className="text-sm text-gray-500 dark:text-dark-400">
          Add personalization fields when importing contacts to use them in your scripts.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-50 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-600 mb-4">
        Available Personalization Fields
      </h3>
      
      <div className="space-y-6">
        {fields.map(([field, stats]) => (
          <div 
            key={field}
            className="bg-gray-50 dark:bg-dark-100 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-dark-600">
                  {field}
                </h4>
                <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">
                  Use <code className="px-1 py-0.5 bg-gray-100 dark:bg-dark-200 rounded">{'{{' + field + '}}'}</code> in your scripts
                </p>
              </div>
              <span className="text-sm text-gray-500 dark:text-dark-400">
                {stats.percentage.toFixed(1)}% of contacts
              </span>
            </div>

            {stats.examples.length > 0 && (
              <div className="mt-3">
                <h5 className="text-xs font-medium text-gray-500 dark:text-dark-400 mb-2">
                  Example Values:
                </h5>
                <div className="flex flex-wrap gap-2">
                  {stats.examples.map((example, i) => (
                    <div 
                      key={i}
                      className="text-sm text-gray-700 dark:text-dark-600 bg-white dark:bg-dark-50 px-2 py-1 rounded"
                    >
                      {example}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}