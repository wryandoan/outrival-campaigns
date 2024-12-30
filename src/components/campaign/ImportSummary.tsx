import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { ImportSummarySection } from './ImportSummarySection';
import type { ImportResult } from '../../types/import';

interface ImportSummaryProps {
  result: ImportResult;
  onClose: () => void;
  onConfirm: () => void;
  isUploading?: boolean;
}

export function ImportSummary({ result, onClose, onConfirm, isUploading }: ImportSummaryProps) {
  const handleModalClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50"
      onClick={handleModalClick}
    >
      <div 
        className="bg-white dark:bg-dark-50 rounded-lg p-6 max-w-lg w-full"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-600 mb-4">
          Import Preview
        </h2>

        <div className="space-y-4">
          {result.successful > 0 && (
            <ImportSummarySection
              icon={CheckCircle}
              iconColor="text-green-500"
              title="New Contacts to Import"
              count={result.successful}
              contacts={result.contacts}
            />
          )}

          {result.inSystem?.length > 0 && (
            <ImportSummarySection
              icon={AlertCircle}
              iconColor="text-blue-500"
              title="Already in System"
              count={result.inSystem.length}
              contacts={result.inSystem}
            />
          )}

          {result.inCampaign?.length > 0 && (
            <ImportSummarySection
              icon={AlertTriangle}
              iconColor="text-orange-500"
              title="Already in Campaign"
              count={result.inCampaign.length}
              contacts={result.inCampaign}
            />
          )}

          {result.failed > 0 && (
            <ImportSummarySection
              icon={AlertCircle}
              iconColor="text-red-500"
              title="Failed to Import"
              count={result.failed}
              errors={result.errors}
            />
          )}

          <div className="p-4 bg-gray-100 dark:bg-dark-200 rounded-lg">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-700 dark:text-dark-600">Total Contacts</span>
              <span className="text-gray-900 dark:text-dark-600">
                {result.contacts.length + 
                  (result.inSystem?.length || 0) + 
                  (result.inCampaign?.length || 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-gray-50 hover:bg-gray-200 dark:bg-dark-100 dark:hover:bg-dark-400 text-gray-900 dark:text-dark-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isUploading || (result.successful === 0 && !result.inSystem?.length) }
            className="flex-1 py-2 px-4 bg-dark-100 hover:bg-dark-400 disabled:bg-dark-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Confirm Import'}
          </button>
        </div>
      </div>
    </div>
  );
}
