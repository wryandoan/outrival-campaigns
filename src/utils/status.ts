export const ALL_CONTACT_STATUSES = [
  'awaiting_contact',
  'awaiting_reattempt',
  'awaiting_followup',
  'completed',
  'do_not_contact',
  'failed',
  'in_progress'
] as const;

export type ContactStatus = typeof ALL_CONTACT_STATUSES[number];

export const statusConfig = {
  'awaiting_contact': {
    label: 'Awaiting Contact',
    color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
  },
  'awaiting_reattempt': {
    label: 'Awaiting Reattempt',
    color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
  },
  'awaiting_followup': {
    label: 'Awaiting Follow-up',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
  },
  'completed': {
    label: 'Completed',
    color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
  },
  'do_not_contact': {
    label: 'Do Not Contact',
    color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  },
  'failed': {
    label: 'Failed',
    color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  },
  'in_progress': {
    label: 'In Progress',
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
  }
} as const;