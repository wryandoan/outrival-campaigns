import { API_BASE_URL } from '../api';
import { getAuthToken } from '../api';
import type { ImportContact } from '../../types/import';

interface ImportPreview {
  to_import: ImportContact[];
  in_system: ImportContact[];
  in_campaign: ImportContact[];
}

export async function previewContactImport(
  campaignId: string,
  contacts: ImportContact[]
): Promise<ImportPreview> {
  try {
    const token = await getAuthToken();
    const response = await fetch(
      `${API_BASE_URL}/api/v1/campaigns/${campaignId}/contacts/preview`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ contacts })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to preview contacts');
    }

    const data: ImportPreview = await response.json();
    
    return {
      to_import: data.to_import || [],
      in_system: data.in_system || [],
      in_campaign: data.in_campaign || []
    };
  } catch (error) {
    console.error('Error previewing contacts:', error);
    throw error;
  }
}