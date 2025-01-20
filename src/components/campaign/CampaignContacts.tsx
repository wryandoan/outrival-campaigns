import React, { useState, useEffect } from 'react';
import { ContactsTable } from './ContactsTable';
import { CSVUploader } from './CSVUploader';
import { ImportSummary } from './ImportSummary';
import { ContactDetails } from './ContactDetails';
import { ErrorMessage } from '../ui/ErrorMessage';
import { uploadContacts } from '../../services/contacts/upload';
import type { Campaign } from '../../types';
import type { ImportResult } from '../../types/import';
import type { CampaignContact } from '../../services/contacts/types';
import type { CampaignMemberRole } from '../../services/campaigns/members';

interface CampaignContactsProps {
  campaign: Campaign;
  userRole: CampaignMemberRole | 'owner' | null;
}

export function CampaignContacts({ campaign, userRole }: CampaignContactsProps) {
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedContact, setSelectedContact] = useState<CampaignContact | null>(null);

  // Reset selected contact when campaign changes
  useEffect(() => {
    setSelectedContact(null);
  }, [campaign.campaign_id]);

  const handleUploadSuccess = (result: ImportResult) => {
    setRefreshTrigger(prev => prev + 1);
    setError(null);
    setImportResult(null);
  };

  const handleImportConfirm = async () => {
    if (!importResult) return;

    try {
      await uploadContacts(campaign.campaign_id, importResult);
      setRefreshTrigger(prev => prev + 1);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload contacts');
    }
  };

  if (selectedContact) {
    return (
      <ContactDetails 
        contact={{ contact_id: selectedContact.contact_id }}
        onBack={() => setSelectedContact(null)}
      />
    );
  }

  return (
    <div>
      {error && <ErrorMessage message={error} />}
      
      <ContactsTable
        campaignId={campaign.campaign_id}
        refreshTrigger={refreshTrigger}
        onSelectContact={setSelectedContact}
        userRole={userRole}
        uploadComponent={
          <CSVUploader
            campaignId={campaign.campaign_id}
            onError={setError}
            onSuccess={handleUploadSuccess}
          />
        }
      />

      {importResult && (
        <ImportSummary
          result={importResult}
          onClose={() => setImportResult(null)}
          onConfirm={handleImportConfirm}
        />
      )}
    </div>
  );
}