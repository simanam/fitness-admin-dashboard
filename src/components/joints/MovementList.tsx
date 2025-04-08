// src/components/joints/MovementList.tsx
import React from 'react';
import { Trash2, Edit } from 'lucide-react';
import { Motion } from './MovementTypes';

interface MovementListProps {
  movements: Motion[];
  onEdit: (movement: Motion, index: number) => void;
  onDelete: (movement: Motion, index: number) => void;
  isReadOnly?: boolean;
}

const MovementList: React.FC<MovementListProps> = ({
  movements,
  onEdit,
  onDelete,
  isReadOnly = false,
}) => {
  // Get color based on the movement plane
  const getPlaneColor = (plane: string) => {
    switch (plane) {
      case 'sagittal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'frontal':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'transverse':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'multi-planar':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (movements.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No movements available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {movements.map((movement, index) => (
        <div
          key={`${movement.name}-${index}`}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-gray-900 capitalize flex items-center">
                {movement.name.replace(/_/g, ' ')}
                <span
                  className={`ml-2 inline-block px-2 py-1 text-xs rounded-full ${getPlaneColor(movement.plane)}`}
                >
                  {movement.plane}
                </span>
              </h4>

              <div className="mt-2 text-sm">
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">Range:</span>
                  <span className="font-medium">
                    {movement.range.min}° to {movement.range.max}°
                  </span>
                </div>
                {movement.description && (
                  <div className="mt-1 text-gray-600">
                    {movement.description}
                  </div>
                )}
              </div>
            </div>

            {!isReadOnly && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(movement, index)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(movement, index)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MovementList;
