import React from 'react';

interface ImportModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

export function ImportModal({ onClose, children, title = 'Import File' }: ImportModalProps) {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white dark:bg-dark-50 rounded-lg p-6 max-w-lg w-full">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-600 mb-4">
          {title}
        </h2>
        
        <div className="mb-6">
          {children}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-dark-100 dark:hover:bg-dark-400 text-gray-900 dark:text-dark-600 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}