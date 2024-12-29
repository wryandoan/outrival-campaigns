import React from 'react';

interface ContactsTableHeaderProps {
  onSelectAll: (checked: boolean) => void;
  allSelected: boolean;
  someSelected: boolean;
}

export function ContactsTableHeader({ onSelectAll, allSelected, someSelected }: ContactsTableHeaderProps) {
  return (
    <thead className="border-b border-gray-200 dark:border-dark-200">
      <tr>
        <th scope="col" className="w-[50px] px-6 py-2 text-left">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={allSelected}
            ref={input => {
              if (input) {
                input.indeterminate = someSelected && !allSelected;
              }
            }}
            onChange={(e) => onSelectAll(e.target.checked)}
          />
        </th>
        <th scope="col" className="w-1/3 px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-dark-600 uppercase tracking-wider">
          Name
        </th>
        <th scope="col" className="w-1/4 px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-dark-600 uppercase tracking-wider">
          Phone
        </th>
        <th scope="col" className="w-[120px] px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-dark-600 uppercase tracking-wider">
          Interactions
        </th>
        <th scope="col" className="w-[100px] px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-dark-600 uppercase tracking-wider">
          Contact Card
        </th>
      </tr>
    </thead>
  );
}