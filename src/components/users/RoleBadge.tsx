// src/components/users/RoleBadge.tsx
import React from 'react';

interface RoleBadgeProps {
  role: string;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  // Determine badge color based on role
  const getBadgeClasses = () => {
    switch (role) {
      case 'EDITOR':
        return 'bg-blue-100 text-blue-800';
      case 'READONLY':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format role for display
  const formatRole = (role: string) => {
    return role.toLowerCase().replace(/_/g, ' ');
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${getBadgeClasses()}`}
    >
      {formatRole(role)}
    </span>
  );
};

export default RoleBadge;
