import React, { useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FieldMapper } from './FieldMapper';
import type { FieldMapping } from '../../types/import';

interface CSVMappingStepProps {
  csvHeaders: string[];
  onBack: () => void;
  onNext: (mapping: FieldMapping) => void;
}

export function CSVMappingStep({ csvHeaders, onBack, onNext }: CSVMappingStepProps) {
  const [mapping, setMapping] = useState<FieldMapping>({});

  const handleUpdateMapping = useCallback((field: keyof FieldMapping, value: string) => {
    setMapping(prev => ({ ...prev, [field]: value }));
  }, []);

  const isValid = mapping.firstName && mapping.lastName && mapping.phoneNumber;

  return (
    <div className="space-y-6">
      <FieldMapper
        csvHeaders={csvHeaders}
        mapping={mapping}
        onUpdateMapping={handleUpdateMapping}
      />

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-400 hover:text-gray-900 dark:hover:text-dark-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          onClick={() => onNext(mapping)}
          disabled={!isValid}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:bg-blue-400 disabled:cursor-not-allowed hover:bg-blue-700"
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}