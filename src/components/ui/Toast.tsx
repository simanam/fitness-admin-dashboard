// src/components/ui/Toast.tsx
import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ToastProps {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose: (id: string) => void;
}

const Toast = ({
  id,
  title,
  message,
  type = 'info',
  duration = 5000,
  onClose,
}: ToastProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose(id), 300); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onClose]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div
      className={cn(
        'fixed right-4 transform transition-all duration-300 ease-in-out border rounded-lg shadow-md p-4 max-w-md z-50 flex items-start',
        getColors(),
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
      style={{ marginTop: '1rem' }}
    >
      <div className="flex-shrink-0 mr-3">{getIcon()}</div>
      <div className="flex-1">
        <h3 className="font-medium text-sm">{title}</h3>
        <p className="text-sm mt-1 text-gray-700">{message}</p>
      </div>
      <button
        onClick={handleClose}
        className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
