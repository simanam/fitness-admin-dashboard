// src/components/joints/TypeBadge.tsx
import React from 'react';
import { cn } from '../../lib/utils';

interface TypeBadgeProps {
  type: string;
  className?: string;
}

const TypeBadge: React.FC<TypeBadgeProps> = ({ type, className }) => {
  // Function to get the appropriate color for the joint type
  const getTypeColor = (jointType: string): string => {
    const colors: Record<string, string> = {
      ball_and_socket: 'bg-purple-100 text-purple-800',
      hinge: 'bg-blue-100 text-blue-800',
      pivot: 'bg-green-100 text-green-800',
      ellipsoidal: 'bg-yellow-100 text-yellow-800',
      saddle: 'bg-red-100 text-red-800',
      gliding: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800',
    };

    return colors[jointType] || 'bg-gray-100 text-gray-800';
  };

  // Format the joint type text for display
  const formatType = (jointType: string): string => {
    return jointType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full',
        getTypeColor(type),
        className
      )}
    >
      {formatType(type)}
    </span>
  );
};

export default TypeBadge;
