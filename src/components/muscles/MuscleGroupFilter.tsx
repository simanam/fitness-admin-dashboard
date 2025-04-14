// src/components/muscles/MuscleGroupFilter.tsx - Updated with Info Box
import { useState } from 'react';
import { Info, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMuscleGroups } from '../../hooks/useMuscleGroups';
import type { FC } from 'react';

interface MuscleGroupFilterProps {
  selectedGroupId?: string;
  onChange: (groupId: string | undefined) => void;
}

const MuscleGroupFilter: FC<MuscleGroupFilterProps> = ({
  selectedGroupId,
  onChange,
}) => {
  const { muscleGroups, isLoading } = useMuscleGroups();
  const [showInfo, setShowInfo] = useState(false);

  const categoryColors = {
    upper_body: 'bg-blue-100 text-blue-800',
    lower_body: 'bg-green-100 text-green-800',
    core: 'bg-purple-100 text-purple-800',
  };

  if (isLoading) {
    return (
      <div className="animate-pulse flex items-center space-x-2">
        <div className="h-9 w-40 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
              !selectedGroupId
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Groups
          </button>

          {muscleGroups.map((group) => (
            <button
              type="button"
              key={group.id}
              onClick={() => onChange(group.id)}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 ${
                selectedGroupId === group.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  categoryColors[group.category as keyof typeof categoryColors]
                }`}
              />
              <span>{group.name}</span>
              {group.muscles && (
                <span className="text-xs opacity-75">
                  ({group.muscles.length})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            title="About Muscle Groups"
          >
            <Info size={18} />
          </button>
          <Link
            to="/muscles/groups"
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            title="Manage Muscle Groups"
          >
            <Settings size={18} />
          </Link>
        </div>
      </div>

      {showInfo && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 animate-fadeIn">
          <div className="flex">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-700">
                About Muscle Groups
              </h3>
              <div className="mt-2 text-sm text-blue-600">
                <p>
                  Muscle groups help you organize muscles by anatomical regions
                  (e.g., Upper Body, Arms). Filter muscles by selecting a group
                  above or{' '}
                  <Link to="/muscles/groups" className="underline font-medium">
                    manage your groups
                  </Link>{' '}
                  to create a custom organization structure.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MuscleGroupFilter;
