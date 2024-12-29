import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { statusConfig } from '../../../utils/status';
import type { StatusHistoryEntry } from '../../../services/contacts/status-history';

interface StatusHistoryTableProps {
  history: StatusHistoryEntry[];
}

export function StatusHistoryTable({ history }: StatusHistoryTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-dark-200">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-200">
        <thead className="bg-gray-50 dark:bg-dark-100">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-600 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-600 uppercase tracking-wider">
              Notes
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-600 uppercase tracking-wider">
              Changed
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-dark-50 divide-y divide-gray-200 dark:divide-dark-200">
          {history.map((entry) => (
            <tr key={entry.history_id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-600">
                {statusConfig[entry.contact_status as keyof typeof statusConfig]?.label || entry.contact_status}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 dark:text-dark-400">
                {entry.notes || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-400">
                {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}