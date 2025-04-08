// src/components/movement-patterns/CategoryFilter.tsx
import React from 'react';

interface CategoryFilterProps {
  selectedCategory: string;
  onChange: (category: string) => void;
  categories: { value: string; label: string }[];
  isLoading?: boolean;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onChange,
  categories,
  isLoading = false,
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">Filter by Category</h3>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onChange('')}
          className={`px-3 py-1.5 text-sm rounded-md ${
            selectedCategory === ''
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => onChange(category.value)}
            className={`px-3 py-1.5 text-sm rounded-md ${
              selectedCategory === category.value
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
