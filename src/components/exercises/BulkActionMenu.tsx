// src/components/exercises/BulkActionMenu.tsx
import { useState } from 'react';
import { Archive, ChevronDown, RefreshCcw, ArrowUpCircle } from 'lucide-react';
import { useExerciseStatus } from '../../hooks/useExerciseStatus';
import ConfirmationDialog from '../ui/confirmation-dialog';

interface BulkActionMenuProps {
  selectedIds: string[];
  onActionComplete: () => void;
  disabled?: boolean;
}

export const BulkActionMenu = ({
  selectedIds,
  onActionComplete,
  disabled = false,
}: BulkActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState<{
    status: string;
    title: string;
    message: string;
  } | null>(null);

  const { bulkUpdateStatus, isUpdating } = useExerciseStatus({
    onSuccess: () => {
      onActionComplete();
      setIsOpen(false);
      setShowConfirmDialog(false);
    },
  });

  const handleActionSelect = (action: {
    status: string;
    title: string;
    message: string;
  }) => {
    setSelectedAction(action);
    setShowConfirmDialog(true);
    setIsOpen(false);
  };

  const handleConfirm = async () => {
    if (!selectedAction) return;
    await bulkUpdateStatus(selectedIds, selectedAction.status);
  };

  const actions = [
    {
      status: 'PUBLISHED',
      label: 'Publish Selected',
      icon: ArrowUpCircle,
      title: 'Publish Exercises',
      message: `Are you sure you want to publish ${selectedIds.length} selected exercises?`,
    },
    {
      status: 'DRAFT',
      label: 'Move to Draft',
      icon: RefreshCcw,
      title: 'Move to Draft',
      message: `Are you sure you want to move ${selectedIds.length} selected exercises to draft?`,
    },
    {
      status: 'ARCHIVED',
      label: 'Archive Selected',
      icon: Archive,
      title: 'Archive Exercises',
      message: `Are you sure you want to archive ${selectedIds.length} selected exercises?`,
    },
  ];

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled || isUpdating || selectedIds.length === 0}
          className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50"
        >
          <span>Bulk Actions</span>
          <ChevronDown className="h-4 w-4" />
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1" role="menu">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.status}
                    onClick={() => handleActionSelect(action)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    role="menuitem"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selectedAction && (
        <ConfirmationDialog
          isOpen={showConfirmDialog}
          onClose={() => {
            setShowConfirmDialog(false);
            setSelectedAction(null);
          }}
          onConfirm={handleConfirm}
          title={selectedAction.title}
          message={selectedAction.message}
          confirmText="Continue"
          type="info"
          isLoading={isUpdating}
        />
      )}
    </>
  );
};

export default BulkActionMenu;
