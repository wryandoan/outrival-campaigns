import React, { useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FieldMapper } from './FieldMapper';
import { PersonalizationFields } from './PersonalizationFields';
import type { FieldMapping, PersonalizationField } from '../../types/import';

interface CSVMappingStepProps {
  csvHeaders: string[];
  onBack: () => void;
  onNext: (mapping: FieldMapping) => void;
}

export function CSVMappingStep({ csvHeaders, onBack, onNext }: CSVMappingStepProps) {
  const [mapping, setMapping] = useState<FieldMapping>({});
  const [personalizationFields, setPersonalizationFields] = useState<PersonalizationField[]>([]);

  const handleUpdateMapping = useCallback((field: keyof Omit<FieldMapping, 'personalization'>, value: string) => {
    setMapping(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleAddPersonalizationField = useCallback(() => {
    setPersonalizationFields(prev => [...prev, { key: '', csvHeader: '' }]);
  }, []);

  const handleRemovePersonalizationField = useCallback((index: number) => {
    setPersonalizationFields(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpdatePersonalizationField = useCallback((index: number, updates: Partial<PersonalizationField>) => {
    setPersonalizationFields(prev => prev.map((field, i) => 
      i === index ? { ...field, ...updates } : field
    ));
  }, []);

  const handleNext = useCallback(() => {
    const validFields = personalizationFields.filter(f => f.key && f.csvHeader);
    onNext({
      ...mapping,
      personalization: validFields.length > 0 ? validFields : undefined
    });
  }, [mapping, personalizationFields, onNext]);

  const isValid = mapping.firstName && mapping.lastName && mapping.phoneNumber;

  return (
    <div className="space-y-6">
      <FieldMapper
        csvHeaders={csvHeaders}
        mapping={mapping}
        onUpdateMapping={handleUpdateMapping}
      />

      <div className="border-t border-gray-200 dark:border-dark-200 pt-6">
        <PersonalizationFields
          csvHeaders={csvHeaders}
          fields={personalizationFields}
          onAddField={handleAddPersonalizationField}
          onRemoveField={handleRemovePersonalizationField}
          onUpdateField={handleUpdatePersonalizationField}
        />
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-400 hover:text-gray-900 dark:hover:text-dark-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          onClick={handleNext}
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