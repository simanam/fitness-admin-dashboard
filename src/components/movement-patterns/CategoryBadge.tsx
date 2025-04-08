// src/components/movement-patterns/CategoryBadge.tsx
import React from 'react';
import { cn } from '../../lib/utils';

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  className,
}) => {
  const getBadgeColor = (cat: string) => {
    const categoriesMap: Record<string, string> = {
      lower_body: 'bg-green-100 text-green-800',
      upper_body: 'bg-blue-100 text-blue-800',
      core: 'bg-yellow-100 text-yellow-800',
      full_body: 'bg-purple-100 text-purple-800',
    };

    return categoriesMap[cat.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const formatCategoryName = (cat: string) => {
    return cat
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <span
      className={cn(
        'px-2 py-1 text-xs font-medium rounded-full',
        getBadgeColor(category),
        className
      )}
    >
      {formatCategoryName(category)}
    </span>
  );
};

export default CategoryBadge;
