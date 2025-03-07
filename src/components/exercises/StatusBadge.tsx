// src/components/exercises/StatusBadge.tsx
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-yellow-100 text-yellow-800',
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
        statusColors[status as keyof typeof statusColors],
        className
      )}
    >
      {status.toLowerCase()}
    </span>
  );
};

export default StatusBadge;
