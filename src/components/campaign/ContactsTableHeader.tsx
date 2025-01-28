import React from 'react';

interface ContactsTableHeaderProps {
  canEdit: boolean;
}

export function ContactsTableHeader({ canEdit }: ContactsTableHeaderProps) {
  return (
    <thead className="border-b border-gray-200 dark:border-dark-200">
      <tr>
        {canEdit && (
          <th scope="col" className="w-12 pl-6 pr-0 py-4">
            {/* Empty header cell for checkbox column */}
          </th>
        )}
        <th scope="col" className="w-1/3 px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-dark-600 uppercase tracking-wider">
          Name
        </th>
        <th scope="col" className="w-1/4 px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-dark-600 uppercase tracking-wider">
          Phone
        </th>
        <th scope="col" className="w-[140px] px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-dark-600 uppercase tracking-wider">
          Interactions
        </th>
        <th scope="col" className="w-[120px] px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-dark-600 uppercase tracking-wider">
          Contact Card
        </th>
      </tr>
    </thead>
  );
}