export const insightMap = {
  // Success states
  'success_response': {
    label: 'Successful Response',
    color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
  },
  'dnc_request': {
    label: 'DNC Requested',
    color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
  },
  'unsubscribe_request': {
    label: 'Unsubscribe Request',
    color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
  },
  'not_interested': {
    label: 'Not Interested',
    color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
  },
  'call_followup_requested': {
    label: 'Follow-up Call Requested',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
  },
  'sms_followup_requested': {
    label: 'Follow-up SMS Requested',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
  },

  // Voicemail states
  'voicemail_left': {
    label: 'Voicemail Left',
    color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
  },
  'voicemail_box_full': {
    label: 'Voicemail Full',
    color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
  },

  // Error states
  'network_error': {
    label: 'Network Error',
    color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200'
  },
  'invalid_number': {
    label: 'Invalid Number',
    color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
  },

  // No answer states
  'no_answer': {
    label: 'No Answer',
    color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200'
  },
  'line_busy': {
    label: 'Line Busy',
    color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200'
  },
  'unreachable': {
    label: 'Unreachable',
    color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200'
  }
} as const;

export type InsightType = keyof typeof insightMap;

export function getInsightConfig(insight: string) {
  return insightMap[insight as InsightType] || {
    label: insight.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200'
  };
}