// src/components/clients/StatusBadge.tsx
import React from 'react';
import { Check, AlertCircle, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'suspended';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  size = 'md',
}) => {
  const statusConfig = {
    active: {
      label: 'Active',
      icon: Check,
      color: 'bg-green-100 text-green-800',
    },
    inactive: {
      label: 'Inactive',
      icon: Clock,
      color: 'bg-gray-100 text-gray-800',
    },
    suspended: {
      label: 'Suspended',
      icon: AlertCircle,
      color: 'bg-red-100 text-red-800',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        config.color,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={cn('mr-1', size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
