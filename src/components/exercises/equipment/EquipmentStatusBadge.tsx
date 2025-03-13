// src/components/exercises/equipment/EquipmentStatusBadge.tsx
import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface EquipmentStatusBadgeProps {
  isRequired: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const EquipmentStatusBadge: React.FC<EquipmentStatusBadgeProps> = ({
  isRequired,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-2.5 py-1.5',
  };

  if (isRequired) {
    return (
      <div
        className={`inline-flex items-center rounded-full bg-red-50 text-red-700 ${sizeClasses[size]} ${className}`}
      >
        <AlertCircle
          className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`}
        />
        Required
      </div>
    );
  } else {
    return (
      <div
        className={`inline-flex items-center rounded-full bg-green-50 text-green-700 ${sizeClasses[size]} ${className}`}
      >
        <CheckCircle
          className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`}
        />
        Optional
      </div>
    );
  }
};

export default EquipmentStatusBadge;
