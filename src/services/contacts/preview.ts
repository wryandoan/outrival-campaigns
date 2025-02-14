import { API_BASE_URL } from '../api';
import { getAuthToken } from '../api';
import type { FieldMapping, ImportError, ImportContact, PreviewResult } from '../../types/import';

interface CSVUploadRequest {
  file_path: string;
  headers: string[];
  mapping: FieldMapping;
}

interface PreviewResult {
  existingSystemContactsToAddSample: ImportContact[];
  existingCampaignContactsToNotAddSample: ImportContact[];
  newContactsToAddSample: ImportContact[];
  failedToAddContactsSample: ImportError[];
  existingSystemContactsToAddCount: number;
  existingCampaignContactsToNotAddCount: number;
  newContactsToAddCount: number;
  failedContactsToNotAddCount: number;
}

export async function previewContactImport(
  campaignId: string,
  request: CSVUploadRequest
): Promise<PreviewResult> {
  try {
    const token = await getAuthToken();
    const response = await fetch(
      `${API_BASE_URL}/api/v1/campaigns/${campaignId}/get-preview`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(request)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to preview contacts');
    }

    const data: PreviewResult = await response.json();
    
    return {
      existingSystemContactsToAddSample: data.existingSystemContactsToAddSample || [],
      existingCampaignContactsToNotAddSample: data.existingCampaignContactsToNotAddSample || [],
      newContactsToAddSample: data.newContactsToAddSample || [],
      failedToAddContactsSample: data.failedToAddContactsSample || [],
      existingSystemContactsToAddCount: data.existingSystemContactsToAddCount || 0,
      existingCampaignContactsToNotAddCount: data.existingCampaignContactsToNotAddCount || 0,
      newContactsToAddCount: data.newContactsToAddCount || 0,
      failedContactsToNotAddCount: data.failedContactsToNotAddCount || 0
    };
  } catch (error) {
    console.error('Error previewing contacts:', error);
    throw error;
  }
}