// src/components/movement-patterns/TypeFilter.tsx
import React from 'react';

interface TypeFilterProps {
  selectedType: string;
  onChange: (type: string) => void;
  types: { value: string; label: string }[];
}

const TypeFilter: React.FC<TypeFilterProps> = ({
  selectedType,
  onChange,
  types,
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">Filter by Type</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onChange('')}
          className={`px-3 py-1.5 text-sm rounded-md ${
            selectedType === ''
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {types.map((type) => (
          <button
            key={type.value}
            onClick={() => onChange(type.value)}
            className={`px-3 py-1.5 text-sm rounded-md ${
              selectedType === type.value
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TypeFilter;
