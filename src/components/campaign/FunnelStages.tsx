import React, { useState } from 'react';
import { GripVertical, X, Plus, Check } from 'lucide-react';

interface FunnelStagesProps {
  stages: string[];
  onUpdate?: (stages: string[]) => void;
  disabled?: boolean;
}

export function FunnelStages({ stages: initialStages, onUpdate, disabled }: FunnelStagesProps) {
  const [stages, setStages] = useState(initialStages);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    
    const items = [...stages];
    const draggedItem = items[draggedIndex];
    items.splice(draggedIndex, 1);
    items.splice(index, 0, draggedItem);
    
    setStages(items);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditValue(stages[index]);
  };

  const handleEdit = () => {
    if (editValue.trim()) {
      const newStages = [...stages];
      newStages[editingIndex!] = editValue.trim();
      setStages(newStages);
    }
    setEditingIndex(null);
  };

  const deleteStage = (index: number) => {
    const newStages = stages.filter((_, i) => i !== index);
    setStages(newStages);
  };

  const addStage = () => {
    setStages([...stages, 'New Stage']);
    setEditingIndex(stages.length);
    setEditValue('New Stage');
  };

  const handleSave = () => {
    onUpdate?.(stages);
  };

  return (
    <div className="bg-white dark:bg-dark-50 rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-600">
          Campaign Funnel
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
      
      <div className="space-y-2">
        {stages.map((stage, index) => (
          <div
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className="group flex items-center gap-2 bg-gray-50 dark:bg-dark-100 px-3 py-2 rounded-lg cursor-move"
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
            
            {editingIndex === index ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 bg-white dark:bg-dark-50 px-2 py-1 rounded text-sm dark:text-white border border-gray-300 dark:border-dark-300"
                  autoFocus
                />
                <button 
                  onClick={handleEdit}
                  className="text-dark-600 hover:text-dark-700 dark:text-dark-500 dark:hover:text-dark-400"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between flex-1">
                <span
                  onClick={() => startEditing(index)}
                  className="text-sm font-medium text-gray-900 dark:text-dark-600 cursor-text"
                >
                  {stage}
                </span>
                <button
                  onClick={() => deleteStage(index)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 dark:text-dark-400 dark:hover:text-dark-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
        
        <button
          onClick={addStage}
          disabled={disabled}
          className="flex items-center justify-center gap-1 w-full px-3 py-2 rounded-lg text-sm font-medium text-blue-500 hover:bg-blue-50 dark:text-dark-600 dark:hover:bg-dark-100 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add Stage
        </button>
      </div>
    </div>
  );
}