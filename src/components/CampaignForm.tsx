import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useForm } from '../hooks/useForm';

interface CampaignFormData {
  name: string;
  goal: string;
}

interface CampaignFormProps {
  onSubmit: (data: CampaignFormData) => void;
  error: string | null;
}

const loadingStates = [
  "Creating new campaign",
  "Optimizing conversation flows",
  "Setting up phone numbers",
  "Creating dashboards"
];

export function CampaignForm({ onSubmit, error }: CampaignFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStateIndex, setLoadingStateIndex] = useState(0);
  const { values, handleChange, handleSubmit: handleFormSubmit } = useForm<CampaignFormData>({
    initialValues: { name: '', goal: '' },
    onSubmit: async (data) => {
      setIsSubmitting(true);
      try {
        await onSubmit(data);
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  // Rotate through loading states every 2 seconds
  useEffect(() => {
    if (!isSubmitting) return;

    const interval = setInterval(() => {
      setLoadingStateIndex((current) => 
        current === loadingStates.length - 1 ? 0 : current + 1
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [isSubmitting]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-600 mb-6">Create New Campaign</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-dark-600">
            Campaign Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={values.name}
            onChange={handleChange}
            disabled={isSubmitting}
            className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-dark-300 bg-white dark:bg-dark-50 px-4 py-3 text-gray-900 dark:text-dark-600 shadow-sm focus:border-dark-300 dark:focus:border-dark-200 focus:outline-none focus:ring-1 focus:ring-dark-300 dark:focus:ring-dark-200 placeholder-gray-400 dark:placeholder-dark-400 disabled:opacity-60 disabled:cursor-not-allowed"
            placeholder="(e.g., Spring 2024 Outreach)"
            required
          />
        </div>

        <div>
          <label htmlFor="goal" className="block text-sm font-medium text-gray-700 dark:text-dark-600">
            Campaign Goal
          </label>
          <textarea
            id="goal"
            name="goal"
            value={values.goal}
            onChange={handleChange}
            disabled={isSubmitting}
            rows={12}
            className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-dark-300 bg-white dark:bg-dark-50 px-4 py-3 text-gray-900 dark:text-dark-600 shadow-sm focus:border-dark-300 dark:focus:border-dark-200 focus:outline-none focus:ring-1 focus:ring-dark-300 dark:focus:ring-dark-200 placeholder-gray-400 dark:placeholder-dark-400 disabled:opacity-60 disabled:cursor-not-allowed"
            placeholder="Describe your campaign goal in detail..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-dark-600 bg-dark-100 hover:bg-dark-200 dark:bg-dark-100 dark:hover:bg-dark-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-200 dark:focus:ring-offset-dark-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span className="min-w-[180px] transition-all duration-300">
                {loadingStates[loadingStateIndex]}...
              </span>
            </>
          ) : (
            'Create Campaign'
          )}
        </button>
      </form>
    </div>
  );
}