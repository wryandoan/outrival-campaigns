import { useState } from 'react';
import { updateCampaignPhoneNumbers } from '../services/campaigns/phone-numbers';
import type { Campaign } from '../types';

interface UsePhoneNumbersProps {
  campaignId: string;
  onUpdate?: (campaign: Campaign) => void;
}

export function usePhoneNumbers({ campaignId, onUpdate }: UsePhoneNumbersProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePhoneNumbers = async (phoneNumbers: Campaign['phone_numbers']) => {
    try {
      setIsUpdating(true);
      setError(null);
      const updatedCampaign = await updateCampaignPhoneNumbers(campaignId, phoneNumbers);
      onUpdate?.(updatedCampaign);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update phone numbers');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updatePhoneNumbers,
    isUpdating,
    error
  };
}