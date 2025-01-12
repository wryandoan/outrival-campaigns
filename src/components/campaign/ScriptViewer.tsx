import React, { useState, useCallback } from 'react';
import { Check, Plus, X, GripVertical } from 'lucide-react';
import { PersonalizationTab } from './PersonalizationTab';
import type { CampaignScripts } from '../../services/ai/types';
import type { Campaign } from '../../types';

interface ScriptViewerProps {
  scripts: CampaignScripts;
  campaign: Campaign;
  onUpdate?: (scripts: CampaignScripts) => void;
  disabled?: boolean;
}

type ScriptType = 'outbound' | 'inbound' | 'voicemail' | 'personalization';

export function ScriptViewer({ scripts: initialScripts, campaign, onUpdate, disabled }: ScriptViewerProps) {
  const [scripts, setScripts] = useState<CampaignScripts>(initialScripts);
  const [activeType, setActiveType] = useState<ScriptType>('outbound');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editStep, setEditStep] = useState('');
  const [editContent, setEditContent] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number, e: React.DragEvent) => {
    if (editingIndex !== null) {
      e.preventDefault();
      return;
    }
    setDraggedIndex(index);
  }, [editingIndex]);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || activeType === 'personalization') return;
    
    const items = [...scripts[activeType]];
    const draggedItem = items[draggedIndex];
    items.splice(draggedIndex, 1);
    items.splice(index, 0, draggedItem);
    
    setScripts(prev => ({
      ...prev,
      [activeType]: items
    }));
    setDraggedIndex(index);
  }, [draggedIndex, scripts, activeType]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  const startEditing = useCallback((index: number, step: { step: string; content: string }) => {
    setEditingIndex(index);
    setEditStep(step.step);
    setEditContent(step.content);
  }, []);

  const handleEdit = useCallback(() => {
    if (editStep.trim() && editContent.trim() && activeType !== 'personalization') {
      const newSteps = [...scripts[activeType]];
      newSteps[editingIndex!] = {
        step: editStep.trim(),
        content: editContent.trim()
      };
      setScripts(prev => ({
        ...prev,
        [activeType]: newSteps
      }));
    }
    setEditingIndex(null);
    setEditStep('');
    setEditContent('');
  }, [editStep, editContent, scripts, activeType, editingIndex]);

  const deleteStep = useCallback((index: number) => {
    if (activeType === 'personalization') return;
    
    setScripts(prev => ({
      ...prev,
      [activeType]: prev[activeType].filter((_, i) => i !== index)
    }));
  }, [activeType]);

  const addStep = useCallback(() => {
    if (activeType === 'personalization') return;

    const newStep = {
      step: 'New Step',
      content: 'Add step content here'
    };
    setScripts(prev => ({
      ...prev,
      [activeType]: [...prev[activeType], newStep]
    }));
    setEditingIndex(scripts[activeType].length);
    setEditStep(newStep.step);
    setEditContent(newStep.content);
  }, [activeType, scripts]);

  const handleSave = useCallback(() => {
    onUpdate?.(scripts);
  }, [scripts, onUpdate]);

  const handleTabChange = (type: ScriptType) => {
    setActiveType(type);
    setEditingIndex(null);
    setEditStep('');
    setEditContent('');
  };

  return (
    <div className="bg-white dark:bg-dark-50 rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-600">
          Campaign Scripts
        </h3>
        
        <button
          onClick={handleSave}
          disabled={disabled}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium text-dark-600 bg-dark-100 hover:bg-dark-200 dark:bg-dark-100 dark:hover:bg-dark-400 disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {(['outbound', 'inbound', 'voicemail', 'personalization'] as ScriptType[]).map((type) => (
          <button
            key={type}
            onClick={() => handleTabChange(type)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium capitalize
              ${activeType === type
                ? 'bg-dark-100 text-dark-600 dark:bg-dark-100 dark:text-dark-600'
                : 'text-gray-600 hover:bg-gray-100 dark:text-dark-400 dark:hover:bg-dark-400 dark:hover:text-dark-600'}
            `}
          >
            {type}
          </button>
        ))}
      </div>

      {activeType === 'personalization' ? (
        <PersonalizationTab campaign={campaign} />
      ) : (
        <div className="space-y-2">
          {scripts[activeType].map((step, index) => (
            <div
              key={index}
              draggable={editingIndex === null}
              onDragStart={(e) => handleDragStart(index, e)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className="group bg-gray-50 dark:bg-dark-100 px-3 py-2 rounded-lg"
            >
              {editingIndex === index ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editStep}
                    onChange={(e) => setEditStep(e.target.value)}
                    className="w-full bg-white dark:bg-dark-50 px-2 py-1 rounded text-sm dark:text-white border border-gray-300 dark:border-dark-300"
                    placeholder="Step name"
                    autoFocus
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full bg-white dark:bg-dark-50 px-2 py-1 rounded text-sm dark:text-white border border-gray-300 dark:border-dark-300"
                    placeholder="Step content"
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <button 
                      onClick={handleEdit}
                      className="text-dark-600 hover:text-dark-700 dark:text-dark-500 dark:hover:text-dark-400"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1 cursor-move" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        onClick={() => startEditing(index, step)}
                        className="text-sm font-medium text-gray-900 dark:text-dark-600 cursor-pointer"
                      >
                        {step.step}
                      </span>
                      <button
                        onClick={() => deleteStep(index)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 dark:text-dark-400 dark:hover:text-dark-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p
                      onClick={() => startEditing(index, step)}
                      className="text-sm text-gray-600 dark:text-dark-400 cursor-pointer"
                    >
                      {step.content}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={addStep}
            disabled={disabled}
            className="flex items-center justify-center gap-1 w-full px-3 py-2 rounded-lg text-sm font-medium text-blue-500 hover:bg-blue-50 dark:text-dark-600 dark:hover:bg-dark-100 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Step
          </button>
        </div>
      )}
    </div>
  );
}