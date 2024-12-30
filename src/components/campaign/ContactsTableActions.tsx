import React from 'react';
import { Phone, UserX, UserPlus } from 'lucide-react';
import { Button } from '../../ui/Button';

interface ContactsTableActionsProps {
  selectedCount: number;
  onCallSelected: () => void;
  onRemoveSelected: () => void;
  onImport: () => void;
  isRemoving?: boolean;
  isCallInProgress?: boolean;
}

export function ContactsTableActions({
  selectedCount,
  onCallSelected,
  onRemoveSelected,
  onImport,
  isRemoving,
  isCallInProgress
}: ContactsTableActionsProps) {
  return (
    <div className="flex gap-2 mb-4">
      <Button
        variant="secondary"
        icon={Phone}
        onClick={onCallSelected}
        disabled={selectedCount === 0 || isCallInProgress}
      >
        {isCallInProgress ? 'Calling...' : `Call Contacts (${selectedCount})`}
      </Button>
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