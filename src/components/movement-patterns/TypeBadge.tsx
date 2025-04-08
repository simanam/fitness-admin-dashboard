// src/components/movement-patterns/TypeBadge.tsx
import React from 'react';
import { cn } from '../../lib/utils';

interface TypeBadgeProps {
  type: string;
  className?: string;
}

const TypeBadge: React.FC<TypeBadgeProps> = ({ type, className }) => {
  const getBadgeColor = (patternType: string) => {
    const typesMap: Record<string, string> = {
      push: 'bg-blue-100 text-blue-800',
      pull: 'bg-purple-100 text-purple-800',
      squat: 'bg-red-100 text-red-800',
      hinge: 'bg-yellow-100 text-yellow-800',
      lunge: 'bg-green-100 text-green-800',
      rotation: 'bg-orange-100 text-orange-800',
      gait: 'bg-teal-100 text-teal-800',
      carry: 'bg-indigo-100 text-indigo-800',
    };

    return typesMap[patternType.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const formatTypeName = (patternType: string) => {
    return patternType
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <span
      className={cn(
        'px-2 py-1 text-xs font-medium rounded-full',
        getBadgeColor(type),
        className
      )}
    >
      {formatTypeName(type)}
    </span>
  );
};

export default TypeBadge;
