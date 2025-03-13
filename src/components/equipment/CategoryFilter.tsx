// src/components/equipment/CategoryFilter.tsx
import React from 'react';
import { Box } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: string;
  onChange: (category: string) => void;
  categories: { value: string; label: string }[];
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onChange,
  categories,
}) => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      FREE_WEIGHTS: 'bg-blue-100 text-blue-800',
      MACHINES: 'bg-green-100 text-green-800',
      CABLES: 'bg-purple-100 text-purple-800',
      BODYWEIGHT: 'bg-yellow-100 text-yellow-800',
      CARDIO: 'bg-red-100 text-red-800',
      ACCESSORIES: 'bg-indigo-100 text-indigo-800',
      OTHER: 'bg-gray-100 text-gray-800',
    };

    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (!categories || categories.length === 0) {
    return (
      <div className="animate-pulse flex items-center space-x-2">
        <div className="h-9 w-40 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
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
          key={category.value}
          onClick={() => onChange(category.value)}
          className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 ${
            selectedCategory === category.value
              ? 'bg-gray-900 text-white'
              : `bg-gray-100 text-gray-700 hover:bg-gray-200`
          }`}
        >
          <Box className="h-4 w-4 mr-1" />
          <span>{category.label}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
