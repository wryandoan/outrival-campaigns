import React, { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { processCSVImport } from '../../../services/contacts/process-import';
import { checkExistingCampaignContacts } from '../../../services/contacts/preview';
import { getCampaignContacts } from '../../../services/contacts/campaign-contacts';
import { RemovalSummary } from './RemovalSummary';
import { CSVMappingStep } from '../../csv/CSVMappingStep';
import { parseCSV } from '../../../utils/csv';
import type { ImportResult, CSVParseResult, FieldMapping } from '../../../types/import';

interface ContactRemovalUploaderProps {
  campaignId: string;
  onError: (error: string) => void;
  onSuccess: (result: ImportResult) => void;
}

export function ContactRemovalUploader({ campaignId, onError, onSuccess }: ContactRemovalUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [csvData, setCSVData] = useState<CSVParseResult | null>(null);
  const [removalPreview, setRemovalPreview] = useState<ImportResult | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeOthers, setRemoveOthers] = useState(false);

  const processUpload = useCallback(async (mapping: FieldMapping) => {
    if (!csvData) return;

    try {
      // Process CSV and get initial results including errors
      const result = processCSVImport(csvData, mapping);
      
      if (result.contacts.length === 0 && result.failed === 0) {
        onError('No valid contacts found in the CSV file');
        return;
      }

      // Get phone numbers from valid contacts
      const csvPhoneNumbers = new Set(result.contacts.map(c => c.phone_number));
      
      // Check which contacts exist in the campaign
      const existingInCampaign = await checkExistingCampaignContacts(campaignId, Array.from(csvPhoneNumbers));
      
      // Get all campaign contacts if removing others
      const allCampaignContacts = await getCampaignContacts(campaignId);
      const toRemoveIfEnabled = allCampaignContacts.filter(c => !csvPhoneNumbers.has(c.phone_number));

      // Find contacts that exist in CSV but not in campaign
      const notInCampaign = result.contacts.filter(c => !existingInCampaign.has(c.phone_number));

      setRemovalPreview({
        ...result,
        contacts: result.contacts.filter(c => existingInCampaign.has(c.phone_number)),
        successful: existingInCampaign.size,
        existing: 0,
        notInCampaign,
        toRemoveIfEnabled,
        removeOthers,
        failed: result.failed,
        errors: result.errors
      });
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to process CSV file');
    }
  }, [campaignId, onError, removeOthers, csvData]);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file || !file.name.endsWith('.csv')) {
      onError('Please upload a CSV file');
      return;
    }

    try {
      const text = await file.text();
      const parsedCSV = parseCSV(text);
      setCSVData(parsedCSV);
    } catch (err) {
      onError('Failed to read CSV file');
    }
  }, [onError]);

  const handleConfirmRemoval = async () => {
    if (!removalPreview) return;

    try {
      setIsRemoving(true);
      onSuccess(removalPreview);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to remove contacts');
    } finally {
      setIsRemoving(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (removalPreview) {
    return (
      <RemovalSummary
        result={removalPreview}
        onClose={() => setRemovalPreview(null)}
        onConfirm={handleConfirmRemoval}
        isRemoving={isRemoving}
      />
    );
  }

  if (csvData) {
    return (
      <CSVMappingStep
        csvHeaders={csvData.headers}
        onBack={() => setCSVData(null)}
        onNext={processUpload}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging
            ? 'border-dark-300 bg-dark-50'
            : 'border-gray-300 dark:border-dark-300'
        }`}
      >
        <div className="flex flex-col items-center">
          <Upload className="w-8 h-8 text-gray-400 dark:text-dark-400 mb-2" />
          <p className="text-gray-600 dark:text-dark-400 mb-2">
            Drag and drop your removal list CSV file here
          </p>
          <p className="text-sm text-gray-500 dark:text-dark-400">
            File should contain 'name' and 'phone' columns
          </p>
        </div>
      </div>

      <div className="flex justify-center w-full" onClick={(e) => e.stopPropagation()}>
        <label className="flex items-center gap-3 text-sm relative cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={removeOthers}
              onChange={(e) => setRemoveOthers(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-dark-400 rounded-full peer peer-checked:bg-green-400 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </div>
          <span className="text-gray-700 dark:text-dark-400">
            Remove contacts not present in uploaded CSV
          </span>
        </label>
      </div>
    </div>
  );
}