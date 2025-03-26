// src/components/exercises/StatusDropdown.tsx
import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useExerciseStatus } from '../../hooks/useExerciseStatus';

interface StatusDropdownProps {
  exerciseId: string;
  currentStatus: string;
  onStatusChange: () => void;
  disabled?: boolean;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  exerciseId,
  currentStatus,
  onStatusChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { updateStatus, isUpdating } = useExerciseStatus({
    onSuccess: onStatusChange,
  });

  const statuses = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    {
      value: 'published',
      label: 'Published',
      color: 'bg-green-100 text-green-800',
    },
    {
      value: 'archived',
      label: 'Archived',
      color: 'bg-yellow-100 text-yellow-800',
    },
  ];

  const currentStatusObject =
    statuses.find((s) => s.value === currentStatus.toLowerCase()) ||
    statuses[0];

  const handleStatusChange = async (status: string) => {
    setIsOpen(false);
    if (status !== currentStatus && !isUpdating && !disabled) {
      await updateStatus(exerciseId, status);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-full ${
          currentStatusObject.color
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        disabled={disabled || isUpdating}
      >
        <span>{currentStatusObject.label}</span>
        {!disabled && <ChevronDown className="ml-1 h-3 w-3" />}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-36 bg-white rounded-md shadow-lg">
          <ul className="py-1">
            {statuses.map((status) => (
              <li key={status.value}>
                <button
                  onClick={() => handleStatusChange(status.value)}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between ${
                    status.value === currentStatus.toLowerCase()
                      ? 'bg-gray-100'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span>{status.label}</span>
                  {status.value === currentStatus.toLowerCase() && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;
