// src/components/users/RoleFilter.tsx
import React from 'react';

interface RoleFilterProps {
  selectedRole: string;
  onChange: (role: string) => void;
}

const RoleFilter: React.FC<RoleFilterProps> = ({ selectedRole, onChange }) => {
  const roles = [
    { value: '', label: 'All Roles' },
    { value: 'EDITOR', label: 'Editor' },
    { value: 'READONLY', label: 'Read Only' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {roles.map((role) => (
        <button
          key={role.value}
          onClick={() => onChange(role.value)}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            selectedRole === role.value
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {role.label}
        </button>
      ))}
    </div>
  );
};

export default RoleFilter;
