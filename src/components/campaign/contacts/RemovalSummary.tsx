import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { ImportSummarySection } from '../ImportSummarySection';
import type { ImportResult } from '../../../types/import';

interface RemovalSummaryProps {
  result: ImportResult;
  onClose: () => void;
  onConfirm: () => void;
  isRemoving?: boolean;
}

export function RemovalSummary({ result, onClose, onConfirm, isRemoving }: RemovalSummaryProps) {
  const handleModalClick = (e: React.MouseEvent) => {
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
          Contact Change Preview
        </h2>

        <div className="space-y-4">
          {result.successful > 0 && (
            <ImportSummarySection
              icon={CheckCircle}
              iconColor="text-green-500"
              title={result.removeOthers ? "Contacts to Keep (Found in CSV)" : "Contacts to Remove (Found in CSV)"}
              count={result.successful}
              contacts={result.contacts}
            />
          )}

          {result.notInCampaign?.length > 0 && (
            <ImportSummarySection
              icon={AlertCircle}
              iconColor="text-orange-500"
              title="Not Found in Campaign"
              count={result.notInCampaign.length}
              contacts={result.notInCampaign}
            />
          )}

          {result.removeOthers && result.toRemoveIfEnabled?.length > 0 && (
            <ImportSummarySection
              icon={AlertTriangle}
              iconColor="text-red-500"
              title="Contacts to Remove (Not found in CSV)"
              count={result.toRemoveIfEnabled.length}
              contacts={result.toRemoveIfEnabled}
            />
          )}

          {result.failed > 0 && (
            <ImportSummarySection
              icon={AlertCircle}
              iconColor="text-red-500"
              title="Failed to Process"
              count={result.failed}
              errors={result.errors}
            />
          )}

          <div className="space-y-2">
            <div className="p-4 bg-gray-100 dark:bg-dark-200 rounded-lg">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-700 dark:text-dark-600">
                  {result.removeOthers ? 'Total Contacts to Remove' : 'Contacts to Remove'}
                </span>
                <span className="text-gray-900 dark:text-dark-600">
                  {result.removeOthers ? (result.toRemoveIfEnabled?.length || 0) : result.successful}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-dark-100 dark:hover:bg-dark-400 text-gray-900 dark:text-dark-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isRemoving || (result.removeOthers ? false : result.successful === 0)}
            className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {isRemoving ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}