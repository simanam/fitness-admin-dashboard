// src/components/muscles/BulkActionMenu.tsx
import { useState } from 'react';
import { Trash2, ChevronDown } from 'lucide-react';
import ConfirmationDialog from '../ui/confirmation-dialog';

interface BulkActionMenuProps {
  selectedIds: string[];
  onActionComplete: () => void;
  disabled?: boolean;
}

const BulkActionMenu: React.FC<BulkActionMenuProps> = ({
  selectedIds,
  onActionComplete,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Call your bulk delete function here
      onActionComplete();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error performing bulk delete:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const actions = [
    {
      label: 'Delete Selected',
      icon: Trash2,
      onClick: () => {
        setIsOpen(false);
        setShowDeleteDialog(true);
      },
    },
  ];

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled || selectedIds.length === 0}
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
                    key={action.label}
                    onClick={action.onClick}
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

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Muscles"
        message={
          <p>
            Are you sure you want to delete{' '}
            <span className="font-medium">{selectedIds.length}</span> selected{' '}
            {selectedIds.length === 1 ? 'muscle' : 'muscles'}? This action
            cannot be undone.
          </p>
        }
        confirmText="Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </>
  );
};

export default BulkActionMenu;
