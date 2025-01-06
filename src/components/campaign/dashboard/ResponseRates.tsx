import React from 'react';
import { useResponseRates } from '../../../hooks/useResponseRates';
import { Loader2, PhoneCall, PhoneIncoming, PhoneOutgoing, MessageSquare } from 'lucide-react';

interface ResponseRatesProps {
  campaignId: string;
}

export function ResponseRates({ campaignId }: ResponseRatesProps) {
  const { rates, loading, error } = useResponseRates(campaignId);

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400 dark:text-dark-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
        <p className="text-red-800 dark:text-red-200">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-50 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-600 mb-6">
        Call Responses
      </h3>
      
      <div className="space-y-6">
        {/* Overall Response Rate */}
        <div className="p-6 bg-gray-50 dark:bg-dark-100 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <PhoneCall className="w-5 h-5 text-gray-400 dark:text-dark-400" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-dark-600">
              {rates.call_response_rate}% Answer Rate
            </h4>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-gray-200 dark:bg-dark-200 rounded-full h-2.5">
              <div 
                className="bg-green-100 dark:bg-green-900/30 h-2.5 rounded-full"
                style={{ width: `${rates.call_response_rate}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-dark-400">
                {rates.calls_answered} answered
              </span>
              <span className="text-gray-500 dark:text-dark-400">
                {rates.total_calls} total
              </span>
            </div>
          </div>
        </div>

        {/* Communication Statistics */}
        <div className="grid grid-cols-2 gap-4">
          {/* Call Statistics */}
          <div className="p-4 bg-gray-50 dark:bg-dark-100 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <PhoneOutgoing className="w-4 h-4 text-gray-400 dark:text-dark-400" />
              <span className="text-sm font-medium text-gray-500 dark:text-dark-400">
                Outbound Calls
              </span>
            </div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-dark-600">
              {rates.outbound_calls}
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-dark-100 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <PhoneIncoming className="w-4 h-4 text-gray-400 dark:text-dark-400" />
              <span className="text-sm font-medium text-gray-500 dark:text-dark-400">
                Inbound Calls
              </span>
            </div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-dark-600">
              {rates.inbound_calls}
            </div>
          </div>

          {/* SMS Statistics */}
          <div className="p-4 bg-gray-50 dark:bg-dark-100 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-gray-400 dark:text-dark-400 scale-x-[-1]" />
              <span className="text-sm font-medium text-gray-500 dark:text-dark-400">
                Outbound SMS
              </span>
            </div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-dark-600">
              0
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-dark-100 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-gray-400 dark:text-dark-400" />
              <span className="text-sm font-medium text-gray-500 dark:text-dark-400">
                Inbound SMS
              </span>
            </div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-dark-600">
              0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}