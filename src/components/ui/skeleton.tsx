// src/components/ui/skeleton.tsx
import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'h-4 w-full animate-pulse rounded-md bg-gray-200',
        className
      )}
    />
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'h-40 w-full animate-pulse rounded-md bg-gray-200',
        className
      )}
    />
  );
}

export function SkeletonCircle({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'h-10 w-10 animate-pulse rounded-full bg-gray-200',
        className
      )}
    />
  );
}
