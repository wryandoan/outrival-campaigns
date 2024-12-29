export const statusConfig = {
  'awaiting_contact': {
    label: 'Awaiting Contact',
    color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
  },
  'queued': {
    label: 'Queued',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
  },
  'in_progress': {
    label: 'In Progress',
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
  },
  'contacted': {
    label: 'Contacted',
    color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200',
  },
  'awaiting_callback_reattempt': {
    label: 'Awaiting Callback (Reattempt)',
    color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
  },
  'awaiting_callback_scheduled': {
    label: 'Awaiting Callback (Scheduled)',
    color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-200',
  },
  'action_required': {
    label: 'Action Required',
    color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200',
  },
  'awaiting_confirmation': {
    label: 'Awaiting Confirmation',
    color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200',
  },
  'completed': {
    label: 'Completed',
    color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
  },
  'failed': {
    label: 'Failed',
    color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  },
  'do_not_contact': {
    label: 'Do Not Contact',
    color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200',
  }
} as const;