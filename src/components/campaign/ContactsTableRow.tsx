import React from 'react';
import { formatPhoneNumber } from '../../utils/phone';
import { statusConfig } from '../../utils/status';
import type { CampaignContact } from '../../services/contacts/types';

interface ContactsTableRowProps {
  contact: CampaignContact;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onClick: () => void;
  onStatusClick: (status: string) => void;
  canEdit: boolean;
}

export function ContactsTableRow({ 
  contact, 
  selected, 
  onSelect, 
  onClick,
  onStatusClick,
  canEdit
}: ContactsTableRowProps) {
  const status = statusConfig[contact.contact_status as keyof typeof statusConfig];

  const handleRowClick = () => {
    if (canEdit) {
      onSelect(!selected);
    }
  };

  return (
    <tr 
      onClick={handleRowClick}
      className={`hover:bg-gray-50 dark:hover:bg-dark-100 transition-colors ${canEdit ? 'cursor-pointer' : ''}`}
    >
      {canEdit && (
        <td className="w-12 pl-6 pr-0 py-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
        </td>
      )}

      <td className="w-1/3 px-6 py-4">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-dark-600">
            {`${contact.first_name} ${contact.last_name}`.trim()}
          </p>
        </div>
      </td>

      <td className="w-1/4 px-6 py-4">
        <span className="text-sm text-gray-900 dark:text-dark-600">
          {formatPhoneNumber(contact.phone_number)}
        </span>
      </td>

      <td className="w-[140px] px-6 py-4 whitespace-nowrap">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStatusClick(contact.contact_status);
          }}
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${status?.color} hover:opacity-100 hover:shadow-md hover:scale-105 transition-all`}
        >
          {status?.label || 'Awaiting Contact'}
        </button>
      </td>

      <td className="w-[120px] px-6 py-4 text-right">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="text-sm text-blue-600 dark:text-dark-400 hover:text-dark-800 dark:hover:text-dark-600"
        >
          View Contact
        </button>
      </td>
    </tr>
  );
}