// src/components/joints/TypeFilter.tsx
import React from 'react';
import TypeBadge from './TypeBadge';

interface JointTypeOption {
  value: string;
  label: string;
}

interface TypeFilterProps {
  selectedType: string;
  onChange: (type: string) => void;
  types: JointTypeOption[];
}

const TypeFilter: React.FC<TypeFilterProps> = ({
  selectedType,
  onChange,
  types,
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <h3 className="text-sm font-medium text-gray-700">
        Filter by Joint Type
      </h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onChange('')}
          className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
            !selectedType
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          All Types
        </button>

        {types.map((type) => (
          <button
            key={type.value}
            onClick={() => onChange(type.value)}
            className={`flex items-center px-3 py-1.5 text-sm border rounded-md transition-colors ${
              selectedType === type.value
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <TypeBadge type={type.value} className="mr-2" />
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TypeFilter;
