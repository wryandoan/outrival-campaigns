import React, { useState } from 'react';
import { Upload, Loader2, Check } from 'lucide-react';
import { Button } from '../../ui/Button';
import type { Campaign } from '../../../types';

interface ScriptHeaderProps {
  campaign: Campaign;
  onPublish?: () => Promise<void>;
  disabled?: boolean;
}

export function ScriptHeader({ campaign, onPublish, disabled }: ScriptHeaderProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPublishSuccess, setShowPublishSuccess] = useState(false);

  const handlePublish = async () => {
    if (!onPublish) return;

    try {
      setIsPublishing(true);
      await onPublish();
      setShowPublishSuccess(true);
      setTimeout(() => {
        setShowPublishSuccess(false);
      }, 3000);
    } catch (err) {
      // Error is handled by parent component
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-600">
        Campaign Scripts
      </h3>

      {campaign.parent_campaign && (
        <Button
          variant="primary"
          icon={isPublishing ? Loader2 : showPublishSuccess ? Check : Upload}
          onClick={handlePublish}
          disabled={disabled || isPublishing}
          className={`min-w-[140px] transition-all duration-200 ${
            showPublishSuccess ? 'bg-green-500 hover:bg-green-600' : ''
          }`}
        >
          {isPublishing ? (
            <span className="flex items-center">Publishing...</span>
          ) : showPublishSuccess ? (
            <span className="flex items-center">Published!</span>
          ) : (
            'Publish to Live'
          )}
        </Button>
      )}
    </div>
  );
}