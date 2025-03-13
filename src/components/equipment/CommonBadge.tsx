// src/components/equipment/CommonBadge.tsx
import { cn } from '../../lib/utils';

interface CommonBadgeProps {
  isCommon: boolean;
  className?: string;
}

export const CommonBadge = ({ isCommon, className }: CommonBadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
        isCommon ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
        className
      )}
    >
      {isCommon ? 'Common' : 'Specialized'}
    </span>
  );
};

export default CommonBadge;
