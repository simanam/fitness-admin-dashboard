// src/components/exercises/DifficultyIndicator.tsx
import React from 'react';
import { ChevronUp, ChevronDown, Minus } from 'lucide-react';

interface DifficultyIndicatorProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

/**
 * Component to visually represent difficulty changes in exercise relationships
 */
const DifficultyIndicator: React.FC<DifficultyIndicatorProps> = ({
  value,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  // Determine colors and icon based on value
  const getColor = () => {
    if (value > 0) return 'text-red-600 bg-red-50';
    if (value < 0) return 'text-green-600 bg-green-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getIcon = () => {
    if (value > 0) return <ChevronUp className={`${getSizeClass('icon')}`} />;
    if (value < 0) return <ChevronDown className={`${getSizeClass('icon')}`} />;
    return <Minus className={`${getSizeClass('icon')}`} />;
  };

  // Get size-appropriate classes
  const getSizeClass = (type: 'text' | 'icon' | 'padding') => {
    switch (type) {
      case 'text':
        return size === 'sm'
          ? 'text-xs'
          : size === 'md'
            ? 'text-sm'
            : 'text-base';
      case 'icon':
        return size === 'sm'
          ? 'h-3 w-3'
          : size === 'md'
            ? 'h-4 w-4'
            : 'h-5 w-5';
      case 'padding':
        return size === 'sm'
          ? 'px-1.5 py-0.5'
          : size === 'md'
            ? 'px-2 py-1'
            : 'px-3 py-1.5';
      default:
        return '';
    }
  };

  // Get label text
  const getLabel = () => {
    if (!showLabel) return null;

    if (value > 0) return 'Harder';
    if (value < 0) return 'Easier';
    return 'Same';
  };

  return (
    <div
      className={`inline-flex items-center rounded ${getColor()} ${getSizeClass('padding')} ${className}`}
    >
      {getIcon()}
      <span className={`ml-1 font-medium ${getSizeClass('text')}`}>
        {value !== 0 && (value > 0 ? '+' : '')}
        {value}
        {showLabel && (
          <span className="ml-1 text-opacity-75">{getLabel()}</span>
        )}
      </span>
    </div>
  );
};

export default DifficultyIndicator;
