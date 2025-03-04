// src/components/ui/confirmation-dialog.tsx
import { ReactNode } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import Modal from './modal';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info';
  isLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  isLoading = false,
}: ConfirmationDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-md ${
              type === 'danger'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      }
    >
      <div className="flex items-start space-x-4">
        <div
          className={`flex-shrink-0 ${
            type === 'danger' ? 'text-red-600' : 'text-blue-600'
          }`}
        >
          {type === 'danger' ? <AlertTriangle size={24} /> : <Info size={24} />}
        </div>
        <div>{message}</div>
      </div>
    </Modal>
  );
}

export default ConfirmationDialog;
