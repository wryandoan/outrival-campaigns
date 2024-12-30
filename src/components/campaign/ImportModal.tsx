import React from 'react';
import { X } from 'lucide-react';

interface ImportModalProps {
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function ImportModal({ onClose, children, title = 'Import File' }: ImportModalProps) {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white dark:bg-dark-50 rounded-lg w-full max-w-2xl max-h-[calc(100vh-2rem)] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-200">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-600">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-dark-400" />
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}