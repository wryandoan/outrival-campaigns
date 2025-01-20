import React, { useState } from 'react';
import { ScriptHeader } from './script/ScriptHeader';
import { ScriptTabs } from './script/ScriptTabs';
import { ScriptEditor } from './script/ScriptEditor';
import { PersonalizationTab } from './PersonalizationTab';
import type { CampaignScripts } from '../../services/ai/types';
import type { Campaign } from '../../types';

interface ScriptViewerProps {
  scripts: CampaignScripts;
  campaign: Campaign;
  onUpdate?: (scripts: CampaignScripts) => void;
  onPublish?: () => Promise<void>;
  disabled?: boolean;
}

export function ScriptViewer({ 
  scripts: initialScripts, 
  campaign, 
  onUpdate, 
  onPublish,
  disabled 
}: ScriptViewerProps) {
  const [scripts, setScripts] = useState<CampaignScripts>(initialScripts);
  const [activeType, setActiveType] = useState<'outbound' | 'inbound' | 'voicemail' | 'personalization'>('outbound');

  const handleScriptUpdate = (newScripts: CampaignScripts) => {
    setScripts(newScripts);
    onUpdate?.(newScripts);
  };

  return (
    <div className="bg-white dark:bg-dark-50 rounded-lg shadow-sm p-4">
      <ScriptHeader 
        campaign={campaign}
        onPublish={onPublish}
        disabled={disabled}
      />

      <ScriptTabs 
        activeType={activeType}
        onTabChange={setActiveType}
      />

      {activeType === 'personalization' ? (
        <PersonalizationTab campaign={campaign} />
      ) : (
        <ScriptEditor
          scripts={scripts}
          scriptType={activeType}
          onUpdate={handleScriptUpdate}
          disabled={disabled}
        />
      )}
    </div>
  );
}