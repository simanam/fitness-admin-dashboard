// src/components/clients/StatusDropdown.tsx
import React, { useState } from 'react';
import { Check, ChevronDown, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import ConfirmationDialog from '../ui/confirmation-dialog';
import { Textarea } from '../ui/textarea';

interface StatusDropdownProps {
  clientId: string;
  currentStatus: 'active' | 'inactive' | 'suspended';
  onStatusChange: (status: string, reason?: string) => Promise<boolean>;
  disabled?: boolean;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  clientId,
  currentStatus,
  onStatusChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  const statuses = [
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
    {
      value: 'inactive',
      label: 'Inactive',
      color: 'bg-gray-100 text-gray-800',
    },
    {
      value: 'suspended',
      label: 'Suspended',
      color: 'bg-red-100 text-red-800',
      needsReason: true,
    },
  ];

  const currentStatusObj = statuses.find((s) => s.value === currentStatus);

  const handleStatusClick = async (
    status: string,
    needsReason: boolean = false
  ) => {
    if (status === currentStatus) {
      setIsOpen(false);
      return;
    }

    if (needsReason) {
      setShowSuspendDialog(true);
      setIsOpen(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onStatusChange(status);
      if (success) {
        setIsOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuspend = async () => {
    if (!suspendReason.trim()) return;

    setIsSubmitting(true);
    try {
      const success = await onStatusChange('suspended', suspendReason);
      if (success) {
        setShowSuspendDialog(false);
        setSuspendReason('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="relative inline-block text-left">
        <button
          type="button"
          className={cn(
            'inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium',
            currentStatusObj?.color,
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          {currentStatusObj?.label}
          <ChevronDown
            className={cn(
              'ml-1 h-4 w-4 transition-transform',
              isOpen && 'transform rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 z-10 mt-1 w-40 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1" role="menu">
              {statuses.map((status) => (
                <button
                  key={status.value}
                  onClick={() =>
                    handleStatusClick(status.value, status.needsReason)
                  }
                  className={cn(
                    'w-full block px-4 py-2 text-sm text-left',
                    status.value === currentStatus
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                  role="menuitem"
                  disabled={isSubmitting}
                >
                  <span className="flex items-center">
                    {status.value === currentStatus && (
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                    )}
                    <span
                      className={!status.value === currentStatus ? 'ml-6' : ''}
                    >
                      {status.label}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={showSuspendDialog}
        onClose={() => {
          setShowSuspendDialog(false);
          setSuspendReason('');
        }}
        onConfirm={handleSuspend}
        title="Suspend Client"
        message={
          <div>
            <p className="mb-4">
              Are you sure you want to suspend this client? This will
              immediately revoke their API access.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for suspension <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Please provide a reason for suspension..."
                rows={3}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>
        }
        confirmText="Suspend Client"
        type="danger"
        isLoading={isSubmitting}
      />
    </>
  );
};

export default StatusDropdown;
