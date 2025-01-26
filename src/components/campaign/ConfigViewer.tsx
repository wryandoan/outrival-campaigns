import React, { useState } from 'react';
import { ScriptHeader } from './script/ScriptHeader';
import { ScriptTabs } from './script/ScriptTabs';
import { ScriptEditor } from './script/ScriptEditor';
import { PersonalizationTab } from './PersonalizationTab';
import { BotConfiguration } from './BotConfiguration';
import type { CampaignConfiguration } from '../../types/config';
import type { Campaign } from '../../types';

interface ConfigViewerProps {
  configuration: CampaignConfiguration;
  campaign: Campaign;
  onUpdate?: (config: Partial<CampaignConfiguration>) => void;
  onPublish?: () => Promise<void>;
  disabled?: boolean;
}

export function ConfigViewer({ 
  configuration: initialConfig, 
  campaign, 
  onUpdate, 
  onPublish,
  disabled 
}: ConfigViewerProps) {
  const [config, setConfig] = useState<CampaignConfiguration>(initialConfig);
  const [activeType, setActiveType] = useState<'outbound' | 'inbound' | 'voicemail' | 'personalization' | 'configuration'>('outbound');

  const handleScriptUpdate = (newScripts: CampaignConfiguration['scripts']) => {
    const updatedConfig = {
      ...config,
      scripts: newScripts
    };
    setConfig(updatedConfig);
    onUpdate?.(updatedConfig);
  };

  const handleConfigUpdate = (sectionUpdates: Partial<CampaignConfiguration>) => {
    const updatedConfig = {
      ...config,
      ...sectionUpdates
    };
    setConfig(updatedConfig);
    onUpdate?.(updatedConfig);
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
      ) : activeType === 'configuration' ? (
        <BotConfiguration
          configuration={config}
          onUpdate={handleConfigUpdate}
          disabled={disabled}
        />
      ) : (
        <ScriptEditor
          scripts={config.scripts}
          scriptType={activeType}
          onUpdate={handleScriptUpdate}
          disabled={disabled}
        />
      )}
    </div>
  );
}