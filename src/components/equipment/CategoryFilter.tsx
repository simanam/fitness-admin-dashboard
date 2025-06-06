// src/components/equipment/CategoryFilter.tsx
import type { FC } from 'react';
import { Box } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: string;
  onChange: (category: string) => void;
  categories: { value: string; label: string }[];
}

const CategoryFilter: FC<CategoryFilterProps> = ({
  selectedCategory,
  onChange,
  categories,
}) => {
  if (!categories || categories.length === 0) {
    return (
      <div className="animate-pulse flex items-center space-x-2">
        <div className="h-9 w-40 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange('')}
        className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
          !selectedCategory
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        All Categories
      </button>

      {categories.map((category) => (
        <button
          type="button"
          key={category.value}
          onClick={() => onChange(category.value)}
          className="px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1"
          data-state={
            selectedCategory === category.value ? 'active' : 'inactive'
          }
          style={{
            backgroundColor:
              selectedCategory === category.value ? '#111827' : '#F3F4F6',
            color: selectedCategory === category.value ? '#FFFFFF' : '#374151',
          }}
        >
          <Box className="h-4 w-4 mr-1" />
          <span>{category.label}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
