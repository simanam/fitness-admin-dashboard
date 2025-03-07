// src/components/muscles/MuscleGroupCard.tsx
import React from 'react';
import { MuscleGroup } from '../../api/muscleService';
import { Layers, Edit, Trash2 } from 'lucide-react';

interface MuscleGroupCardProps {
  group: MuscleGroup;
  onEdit: (group: MuscleGroup) => void;
  onDelete: (group: MuscleGroup) => void;
}

const MuscleGroupCard: React.FC<MuscleGroupCardProps> = ({
  group,
  onEdit,
  onDelete,
}) => {
  const categoryColors = {
    UPPER_BODY: 'bg-blue-50 border-blue-200 text-blue-700',
    LOWER_BODY: 'bg-green-50 border-green-200 text-green-700',
    CORE: 'bg-purple-50 border-purple-200 text-purple-700',
  };

  const categoryClass =
    categoryColors[group.category as keyof typeof categoryColors] || '';

  return (
    <div className={`border rounded-lg overflow-hidden ${categoryClass}`}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <Layers className="h-5 w-5 mr-2" />
            <h3 className="text-lg font-medium">{group.name}</h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(group)}
              className="p-1 text-gray-500 hover:text-blue-600 rounded-full hover:bg-white"
              title="Edit Group"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => onDelete(group)}
              className="p-1 text-gray-500 hover:text-red-600 rounded-full hover:bg-white"
              title="Delete Group"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="mt-2">
          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-white">
            {group.category.replace('_', ' ')}
          </span>

          {group.parentGroupId && (
            <span className="ml-2 text-sm">
              Parent: {group.parentGroup?.name || 'Unknown'}
            </span>
          )}
        </div>

        {group.description && (
          <p className="mt-2 text-sm">{group.description}</p>
        )}

        {group.muscles && group.muscles.length > 0 && (
          <div className="mt-3">
            <span className="text-xs font-medium">
              {group.muscles.length} Muscles
            </span>
            <div className="mt-1 flex flex-wrap gap-1">
              {group.muscles.slice(0, 5).map((muscle) => (
                <span
                  key={muscle.id}
                  className="inline-block px-2 py-0.5 text-xs rounded-full bg-white"
                >
                  {muscle.commonName || muscle.name}
                </span>
              ))}
              {group.muscles.length > 5 && (
                <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-white">
                  +{group.muscles.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MuscleGroupCard;
