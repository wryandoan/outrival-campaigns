import React from 'react';
import { UserX, UserPlus } from 'lucide-react';
import { Button } from '../../ui/Button';

interface ContactsTableActionsProps {
  selectedCount: number;
  onRemoveSelected: () => void;
  onImport: () => void;
  isRemoving?: boolean;
  canEdit: boolean;
}

export function ContactsTableActions({
  selectedCount,
  onRemoveSelected,
  onImport,
  isRemoving,
  canEdit
}: ContactsTableActionsProps) {
  if (!canEdit) return null;

  return (
    <div className="flex gap-2 mb-4">
      <Button
        variant="secondary"
        icon={UserPlus}
        onClick={onImport}
      >
        Add Contacts
      </Button>
      <Button
        variant="secondary"
        icon={UserX}
        onClick={onRemoveSelected}
        disabled={isRemoving}
      >
        {isRemoving 
          ? 'Removing...' 
          : selectedCount > 0 
            ? `Remove Contacts (${selectedCount})`
            : 'Upload Removal List'
        }
      </Button>
    </div>
  );
}