// src/components/exercises/StatusDropdown.tsx
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useExerciseStatus } from '../../hooks/useExerciseStatus';
import StatusBadge from './StatusBadge';

interface StatusDropdownProps {
  exerciseId: string;
  currentStatus: string;
  onStatusChange?: () => void;
  disabled?: boolean;
}

export const StatusDropdown = ({
  exerciseId,
  currentStatus,
  onStatusChange,
  disabled = false,
}: StatusDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { updateStatus, isUpdating } = useExerciseStatus({
    onSuccess: () => {
      onStatusChange?.();
      setIsOpen(false);
    },
  });

  const statusOptions = {
    DRAFT: ['PUBLISHED', 'ARCHIVED'],
    PUBLISHED: ['DRAFT', 'ARCHIVED'],
    ARCHIVED: ['DRAFT', 'PUBLISHED'],
  };

  const handleStatusChange = async (newStatus: string) => {
    if (isUpdating) return;
    await updateStatus(exerciseId, newStatus);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isUpdating}
        className="flex items-center space-x-1 focus:outline-none disabled:opacity-50"
      >
        <StatusBadge status={currentStatus} />
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-40 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu">
            {statusOptions[currentStatus as keyof typeof statusOptions].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <StatusBadge status={status} />
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;
