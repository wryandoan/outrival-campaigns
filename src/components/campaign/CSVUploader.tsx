import React, { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { processCSVImport } from '../../services/contacts/process-import';
import { uploadContacts, uploadFile, getFileHeaders } from '../../services/contacts/upload';
import { previewContactImport } from '../../services/contacts/preview';
import { parseCSV } from '../../utils/csv/parser';
import { CSVMappingStep } from '../csv/CSVMappingStep';
import { ImportSummary } from './ImportSummary';
import type { PreviewResult, FieldMapping, CSVParseResult } from '../../types/import';

interface CSVUploaderProps {
  campaignId: string;
  onError: (error: string) => void;
  onSuccess: (result: PreviewResult) => void;
}

export function CSVUploader({ campaignId, onError, onSuccess }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [csvData, setCSVData] = useState<CSVParseResult | null>(null);
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const getPreview = useCallback(async (mapping: FieldMapping) => {
    if (!csvData) return;

    try {
      // Get preview from backend
      const preview = await previewContactImport(campaignId, result.contacts);
      
      console.log("Preview response:", preview);

      setPreviewResult(preview);
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

    const MAX_FILE_SIZE = 1 * 1024 * 1024 * 1024; // 1GB in bytes
    if (file.size > MAX_FILE_SIZE) {
      onError('File size must be less than 1GB');
      return;
    }

    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (!['csv'].includes(fileType || '')) {
      onError('Please upload a CSV file');
      return;
    }

    try {
      // Instead of reading file content, upload to Supabase
      const filePath = await uploadFile(file, campaignId);
      
      // Now we'd likely want to store this path or trigger processing
      setCSVData({ filePath, headers: await getFileHeaders(file) });
    } catch (err) {
      onError('Failed to upload file');
    }
  }, [onError]);

  const handleConfirmUpload = async () => {
    if (!previewResult) return;

    try {
      setIsUploading(true);
      const result = await uploadContacts(campaignId, previewResult);
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

  if (previewResult) {
    return (
      <ImportSummary
        result={previewResult}
        onClose={() => setPreviewResult(null)}
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
        onNext={getPreview}
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