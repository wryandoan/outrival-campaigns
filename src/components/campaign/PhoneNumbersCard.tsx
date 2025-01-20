import React, { useState } from 'react';
import { Phone, Check, X, Edit2 } from 'lucide-react';
import { usePhoneNumbers } from '../../hooks/usePhoneNumbers';
import { ErrorMessage } from '../ui/ErrorMessage';
import type { Campaign } from '../../types';

interface PhoneNumbersCardProps {
  campaign: Campaign;
  onUpdate?: (campaign: Campaign) => void;
  disabled?: boolean;
}

export function PhoneNumbersCard({ campaign, onUpdate, disabled }: PhoneNumbersCardProps) {
  const [isEditingCnam, setIsEditingCnam] = useState(false);
  const [cnamValue, setCnamValue] = useState('');
  const { updatePhoneNumbers, isUpdating, error } = usePhoneNumbers({
    campaignId: campaign.campaign_id,
    onUpdate
  });

  if (!campaign.phone_numbers) return null;

  const { primary, secondary = [], cnam } = campaign.phone_numbers;

  const handleSaveCnam = async () => {
    try {
      const updatedPhoneNumbers = {
        ...campaign.phone_numbers,
        phone_numbers: {
          ...campaign.phone_numbers.phone_numbers,
          cnam: cnamValue.trim()
        }
      };

      await updatePhoneNumbers(updatedPhoneNumbers);
      setIsEditingCnam(false);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleCancelEdit = () => {
    setCnamValue('');
    setIsEditingCnam(false);
  };

  const startEditingCnam = () => {
    if (disabled) return;
    setCnamValue(cnam || '');
    setIsEditingCnam(true);
  };

  return (
    <div className="bg-white dark:bg-dark-50 rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-600 mb-4">
        Phone Numbers
      </h3>

      {error && <ErrorMessage message={error} />}

      <div className="space-y-6">
        {/* Primary Number */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-dark-600 mb-2">
            Primary Number
          </h4>
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-dark-100 rounded-lg">
            <Phone className="w-4 h-4 text-gray-400 dark:text-dark-400" />
            <span className="text-gray-900 dark:text-dark-600 font-medium">
              {primary.number}
            </span>
          </div>
        </div>

        {/* Backup Numbers - Only show if there are any */}
        {secondary.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-dark-600 mb-2">
              Backup Numbers
            </h4>
            <div className="space-y-2">
              {secondary.map((phone, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-dark-100 rounded-lg"
                >
                  <Phone className="w-4 h-4 text-gray-400 dark:text-dark-400" />
                  <span className="text-gray-900 dark:text-dark-600">
                    {phone.number}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CNAM */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-dark-600">
              Caller ID Name (CNAM)
            </h4>
          </div>
          
          {isEditingCnam ? (
            <div className="space-y-2">
              <input
                type="text"
                value={cnamValue}
                onChange={(e) => setCnamValue(e.target.value)}
                placeholder="Enter caller ID name"
                className="w-full p-3 bg-white dark:bg-dark-100 border border-gray-300 dark:border-dark-300 rounded-lg text-gray-900 dark:text-dark-600 placeholder-gray-400 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-dark-300"
                autoFocus
                disabled={isUpdating}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-lg transition-colors disabled:opacity-50"
                  disabled={isUpdating}
                >
                  <X className="w-4 h-4 text-gray-500 dark:text-dark-400" />
                </button>
                <button
                  onClick={handleSaveCnam}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-lg transition-colors disabled:opacity-50"
                  disabled={isUpdating}
                >
                  <Check className="w-4 h-4 text-green-500 dark:text-dark-400" />
                </button>
              </div>
            </div>
          ) : (
            <div 
              onClick={startEditingCnam}
              className={`p-3 bg-gray-50 dark:bg-dark-100 rounded-lg flex items-center justify-between ${
                disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-100'
              }`}
            >
              <span className="text-gray-900 dark:text-dark-600">
                {cnam || 'No caller ID set'}
              </span>
              {!disabled && (
                <Edit2 className="w-4 h-4 text-gray-500 dark:text-dark-400" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}