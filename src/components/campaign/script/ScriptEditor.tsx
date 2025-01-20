import React, { useState, useCallback } from 'react';
import { Plus, X, GripVertical, Check } from 'lucide-react';
import type { CampaignScripts } from '../../../services/ai/types';

interface ScriptEditorProps {
  scripts: CampaignScripts;
  scriptType: 'outbound' | 'inbound' | 'voicemail';
  onUpdate: (scripts: CampaignScripts) => void;
  disabled?: boolean;
}

export function ScriptEditor({ scripts, scriptType, onUpdate, disabled }: ScriptEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editStep, setEditStep] = useState('');
  const [editContent, setEditContent] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number, e: React.DragEvent) => {
    if (disabled || editingIndex !== null) {
      e.preventDefault();
      return;
    }
    setDraggedIndex(index);
  }, [editingIndex, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (disabled || draggedIndex === null) return;
    
    const items = [...scripts[scriptType]];
    const draggedItem = items[draggedIndex];
    items.splice(draggedIndex, 1);
    items.splice(index, 0, draggedItem);
    
    onUpdate({
      ...scripts,
      [scriptType]: items
    });
    setDraggedIndex(index);
  }, [draggedIndex, scripts, scriptType, onUpdate, disabled]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  const startEditing = useCallback((index: number, step: { step: string; content: string }) => {
    if (disabled) return;
    setEditingIndex(index);
    setEditStep(step.step);
    setEditContent(step.content);
  }, [disabled]);

  const handleEdit = useCallback(() => {
    if (disabled) return;
    
    if (editStep.trim() && editContent.trim()) {
      const newSteps = [...scripts[scriptType]];
      newSteps[editingIndex!] = {
        step: editStep.trim(),
        content: editContent.trim()
      };
      onUpdate({
        ...scripts,
        [scriptType]: newSteps
      });
    }
    setEditingIndex(null);
    setEditStep('');
    setEditContent('');
  }, [editStep, editContent, scripts, scriptType, editingIndex, onUpdate, disabled]);

  const deleteStep = useCallback((index: number) => {
    if (disabled) return;
    onUpdate({
      ...scripts,
      [scriptType]: scripts[scriptType].filter((_, i) => i !== index)
    });
  }, [scripts, scriptType, onUpdate, disabled]);

  const addStep = useCallback(() => {
    if (disabled) return;
    const newStep = {
      step: 'New Step',
      content: 'Add step content here'
    };
    onUpdate({
      ...scripts,
      [scriptType]: [...scripts[scriptType], newStep]
    });
    setEditingIndex(scripts[scriptType].length);
    setEditStep(newStep.step);
    setEditContent(newStep.content);
  }, [scripts, scriptType, onUpdate, disabled]);

  return (
    <div className="space-y-2">
      {scripts[scriptType].map((step, index) => (
        <div
          key={index}
          draggable={!disabled && editingIndex === null}
          onDragStart={(e) => handleDragStart(index, e)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={`group bg-gray-50 dark:bg-dark-100 px-3 py-2 rounded-lg ${
            disabled ? 'cursor-default' : ''
          }`}
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
                disabled={disabled}
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-white dark:bg-dark-50 px-2 py-1 rounded text-sm dark:text-white border border-gray-300 dark:border-dark-300"
                placeholder="Step content"
                rows={3}
                disabled={disabled}
              />
              <div className="flex justify-end">
                <button 
                  onClick={handleEdit}
                  disabled={disabled}
                  className="text-dark-600 hover:text-dark-700 dark:text-dark-500 dark:hover:text-dark-400 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              {!disabled && (
                <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1 cursor-move" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span
                    onClick={() => startEditing(index, step)}
                    className={`text-sm font-medium text-gray-900 dark:text-dark-600 ${
                      disabled ? '' : 'cursor-pointer'
                    }`}
                  >
                    {step.step}
                  </span>
                  {!disabled && (
                    <button
                      onClick={() => deleteStep(index)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 dark:text-dark-400 dark:hover:text-dark-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p
                  onClick={() => startEditing(index, step)}
                  className={`text-sm text-gray-600 dark:text-dark-400 ${
                    disabled ? '' : 'cursor-pointer'
                  }`}
                >
                  {step.content}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}

      {!disabled && (
        <button
          onClick={addStep}
          disabled={disabled}
          className="flex items-center justify-center gap-1 w-full px-3 py-2 rounded-lg text-sm font-medium text-blue-500 hover:bg-blue-50 dark:text-dark-600 dark:hover:bg-dark-100 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add Step
        </button>
      )}
    </div>
  );
}