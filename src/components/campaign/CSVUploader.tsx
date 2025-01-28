import React, { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { processCSVImport } from '../../services/contacts/process-import';
import { uploadContacts } from '../../services/contacts/upload';
import { previewContactImport } from '../../services/contacts/preview';
import { parseCSV } from '../../utils/csv/parser';
import { CSVMappingStep } from '../csv/CSVMappingStep';
import { ImportSummary } from './ImportSummary';
import type { ImportResult, FieldMapping, CSVParseResult } from '../../types/import';

interface CSVUploaderProps {
  campaignId: string;
  onError: (error: string) => void;
  onSuccess: (result: ImportResult) => void;
}

export function CSVUploader({ campaignId, onError, onSuccess }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [csvData, setCSVData] = useState<CSVParseResult | null>(null);
  const [importPreview, setImportPreview] = useState<ImportResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const processUpload = useCallback(async (mapping: FieldMapping) => {
    if (!csvData) return;

    try {
      // Process CSV and get initial results including errors
      const result = processCSVImport(csvData, mapping);
      
      if (result.contacts.length === 0 && result.failed === 0) {
        onError('No valid contacts found in the CSV file');
        return;
      }

      console.log("Processed contacts:", result.contacts);

      // Get preview from backend
      const preview = await previewContactImport(campaignId, result.contacts);
      
      console.log("Preview response:", preview);

      setImportPreview({
        ...result,
        contacts: preview.to_import,
        successful: preview.to_import.length,
        existing: preview.in_system.length,
        inCampaign: preview.in_campaign,
        inSystem: preview.in_system
      });
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to process file');
    }
  }, [campaignId, csvData, onError]);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) {
      onError('Please upload a file');
      return;
    }

    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx'].includes(fileType || '')) {
      onError('Please upload a CSV or Excel file');
      return;
    }

    try {
      const text = await file.text();
      const parsedData = parseCSV(text);
      setCSVData(parsedData);
    } catch (err) {
      onError('Failed to read file');
    }
  }, [onError]);

  const handleConfirmUpload = async () => {
    if (!importPreview) return;

    try {
      setIsUploading(true);
      const result = await uploadContacts(campaignId, importPreview);
      onSuccess(result);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to upload contacts');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (importPreview) {
    return (
      <ImportSummary
        result={importPreview}
        onClose={() => setImportPreview(null)}
        onConfirm={handleConfirmUpload}
        isUploading={isUploading}
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
          Drag and drop your contact list file here
        </p>
        <p className="text-sm text-gray-500 dark:text-dark-400">
          Accepts CSV or Excel files with name and phone number information
        </p>
      </div>
    </div>
  );
}