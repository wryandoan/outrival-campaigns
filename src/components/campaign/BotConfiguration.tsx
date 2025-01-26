import React, { useState } from 'react';
import { Bot, Mic, Brain, Clock, PhoneOff, Zap, ChevronDown } from 'lucide-react';
import type { CampaignConfiguration } from '../../types/config';

interface BotConfigProps {
  configuration: CampaignConfiguration;
  onUpdate?: (config: Partial<CampaignConfiguration>) => void;
  disabled?: boolean;
}

interface ConfigSection {
  id: string;
  title: string;
  icon: typeof Bot;
  fields: {
    key: string;
    label: string;
    type: 'text' | 'number' | 'boolean';
    path?: string[];
  }[];
}

const configSections: ConfigSection[] = [
  {
    id: 'bot',
    title: 'Bot Settings',
    icon: Bot,
    fields: [
      {
        key: 'answer_delay',
        label: 'Delay in seconds before bot responds (Answer Delay)',
        type: 'number'
      },
      {
        key: 'allow_interruptions',
        label: 'Allow caller to interrupt bot speech (Allow Interruptions)',
        type: 'boolean'
      }
    ]
  },
  {
    id: 'llm',
    title: 'Language Model',
    icon: Brain,
    fields: [
      {
        key: 'model',
        label: 'Language model to use (Model)',
        type: 'text'
      },
      {
        key: 'temperature',
        label: 'Controls randomness of responses (Temperature)',
        type: 'number',
        path: ['params']
      },
      {
        key: 'top_p',
        label: 'Controls diversity of responses (Top P)',
        type: 'number',
        path: ['params']
      },
      {
        key: 'max_tokens',
        label: 'Maximum length of generated responses (Max Tokens)',
        type: 'number',
        path: ['params']
      },
      {
        key: 'presence_penalty',
        label: 'Penalty for token presence (Presence Penalty)',
        type: 'number',
        path: ['params']
      },
      {
        key: 'frequency_penalty',
        label: 'Penalty for token frequency (Frequency Penalty)',
        type: 'number',
        path: ['params']
      }
    ]
  },
  {
    id: 'tts',
    title: 'Text-to-Speech',
    icon: Mic,
    fields: [
      {
        key: 'model',
        label: 'TTS model to use (Model)',
        type: 'text'
      },
      {
        key: 'style',
        label: 'Voice style parameter (Style)',
        type: 'number',
        path: ['params']
      },
      {
        key: 'language',
        label: 'Voice language (Language)',
        type: 'text',
        path: ['params']
      },
      {
        key: 'stability',
        label: 'Voice stability (Stability)',
        type: 'number',
        path: ['params']
      },
      {
        key: 'similarity_boost',
        label: 'Voice similarity enhancement (Similarity Boost)',
        type: 'number',
        path: ['params']
      },
      {
        key: 'use_speaker_boost',
        label: 'Enable speaker boost (Speaker Boost)',
        type: 'boolean',
        path: ['params']
      },
      {
        key: 'voice_id',
        label: 'Voice identifier (Voice ID)',
        type: 'text'
      },
      {
        key: 'output_format',
        label: 'Audio output format (Output Format)',
        type: 'text'
      }
    ]
  },
  {
    id: 'vad',
    title: 'Voice Activity Detection',
    icon: Zap,
    fields: [
      {
        key: 'stop_secs',
        label: 'Silence duration to detect end of speech (Stop Seconds)',
        type: 'number'
      },
      {
        key: 'confidence',
        label: 'Voice detection confidence threshold (Confidence)',
        type: 'number'
      },
      {
        key: 'min_volume',
        label: 'Minimum volume threshold (Minimum Volume)',
        type: 'number'
      },
      {
        key: 'start_secs',
        label: 'Initial silence duration (Start Seconds)',
        type: 'number'
      }
    ]
  },
  {
    id: 'hangup',
    title: 'Call Control',
    icon: PhoneOff,
    fields: [
      {
        key: 'call_timeout',
        label: 'Maximum call duration in seconds (Call Timeout)',
        type: 'number'
      },
      {
        key: 'hangup_delay',
        label: 'Delay before hanging up in seconds (Hangup Delay)',
        type: 'number'
      }
    ]
  }
];

export function BotConfiguration({ configuration, onUpdate, disabled }: BotConfigProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const getConfigValue = (section: string, key: string, path?: string[]) => {
    if (!configuration) return '';
    
    // Get the section config
    const sectionConfig = configuration[section as keyof CampaignConfiguration];
    if (!sectionConfig) return '';

    // If there's a path, traverse it
    if (path) {
      let value = sectionConfig as any;
      for (const pathPart of path) {
        value = value?.[pathPart];
        if (value === undefined) return '';
      }
      return value?.[key] ?? '';
    }

    // Otherwise return direct value
    return (sectionConfig as any)[key] ?? '';
  };

  const handleConfigChange = (section: string, key: string, value: any, path?: string[]) => {
    if (disabled || !onUpdate || !configuration) return;

    // Get current section config
    const currentSection = { ...configuration[section as keyof CampaignConfiguration] } || {};
    
    if (path) {
      // Handle nested updates
      let target = currentSection as any;
      for (let i = 0; i < path.length; i++) {
        const pathPart = path[i];
        if (i === path.length - 1) {
          // Last path part - ensure params object exists
          target[pathPart] = target[pathPart] || {};
          target[pathPart][key] = value === '' ? undefined : value;
        } else {
          // Create path if it doesn't exist
          target[pathPart] = target[pathPart] || {};
          target = target[pathPart];
        }
      }
    } else {
      // Direct update
      (currentSection as any)[key] = value === '' ? undefined : value;
    }

    // Clean up undefined values
    const cleanObject = (obj: any) => {
      Object.keys(obj).forEach(k => {
        if (obj[k] === undefined) {
          delete obj[k];
        } else if (typeof obj[k] === 'object') {
          cleanObject(obj[k]);
        }
      });
    };
    cleanObject(currentSection);

    // Update only the specific section
    onUpdate({
      [section]: currentSection
    } as Partial<CampaignConfiguration>);
  };

  return (
    <div className="space-y-4">
      {configSections.map((section) => {
        const Icon = section.icon;
        const isExpanded = expandedSection === section.id;

        return (
          <div key={section.id} className="bg-gray-50 dark:bg-dark-100 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedSection(isExpanded ? null : section.id)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-gray-400 dark:text-dark-400" />
                <h3 className="text-sm font-medium text-gray-900 dark:text-dark-600">
                  {section.title}
                </h3>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            {isExpanded && (
              <div className="p-4 border-t border-gray-200 dark:border-dark-200 space-y-4">
                {section.fields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-400">
                      {field.label}
                    </label>
                    {field.type === 'boolean' ? (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={getConfigValue(section.id, field.key, field.path) === true}
                          onChange={(e) => handleConfigChange(section.id, field.key, e.target.checked, field.path)}
                          disabled={disabled}
                          className="h-4 w-4 text-dark-600 focus:ring-dark-500 border-gray-300 rounded"
                        />
                      </div>
                    ) : (
                      <input
                        type={field.type}
                        value={getConfigValue(section.id, field.key, field.path)}
                        onChange={(e) => handleConfigChange(
                          section.id,
                          field.key,
                          field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value,
                          field.path
                        )}
                        disabled={disabled}
                        className="block w-full rounded-md border-gray-300 dark:border-dark-300 shadow-sm focus:border-dark-500 focus:ring-dark-500 sm:text-sm dark:bg-dark-50"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}