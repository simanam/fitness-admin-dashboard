// src/components/exercises/MuscleTargetingVisualization.tsx
import { useState, useEffect } from 'react';
import { MuscleTarget } from '../../api/muscleService';

interface MuscleTargetingVisualizationProps {
  targets: MuscleTarget[];
  onSelectTarget?: (target: MuscleTarget) => void;
  selectedTargetId?: string;
}

const MuscleTargetingVisualization = ({
  targets,
  onSelectTarget,
  selectedTargetId,
}: MuscleTargetingVisualizationProps) => {
  const [groupedTargets, setGroupedTargets] = useState<{
    [key: string]: MuscleTarget[];
  }>({});

  // Group targets by muscle group
  useEffect(() => {
    const groups = targets.reduce<{ [key: string]: MuscleTarget[] }>(
      (acc, target) => {
        if (!target.muscle?.muscleGroup) return acc;

        const groupName = target.muscle.muscleGroup.name;
        if (!acc[groupName]) {
          acc[groupName] = [];
        }

        acc[groupName].push(target);
        return acc;
      },
      {}
    );

    setGroupedTargets(groups);
  }, [targets]);

  // Get color based on role
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'primary':
        return {
          bg: 'bg-red-500',
          border: 'border-red-600',
          text: 'text-white',
        };
      case 'secondary':
        return {
          bg: 'bg-blue-500',
          border: 'border-blue-600',
          text: 'text-white',
        };
      case 'synergist':
        return {
          bg: 'bg-green-500',
          border: 'border-green-600',
          text: 'text-white',
        };
      case 'stabilizer':
        return {
          bg: 'bg-purple-500',
          border: 'border-purple-600',
          text: 'text-white',
        };
      default:
        return {
          bg: 'bg-gray-500',
          border: 'border-gray-600',
          text: 'text-white',
        };
    }
  };
  // Get bubble size based on activation percentage
  const getBubbleSize = (percentage: number) => {
    // Scale from 40px to a maximum of 80px
    const minSize = 40;
    const maxSize = 80;
    const size = minSize + ((maxSize - minSize) * percentage) / 100;
    return {
      width: `${size}px`,
      height: `${size}px`,
    };
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Muscle Activation Map
      </h3>

      {Object.keys(groupedTargets).length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No muscle targets defined for this exercise.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTargets).map(([groupName, groupTargets]) => (
            <div key={groupName} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">{groupName}</h4>

              <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border border-gray-100">
                {groupTargets.map((target) => {
                  const { bg, border, text } = getRoleColor(target.role);
                  const bubbleSize = getBubbleSize(target.activationPercentage);
                  const isSelected = target.id === selectedTargetId;

                  return (
                    <div
                      key={target.id}
                      className="relative flex flex-col items-center"
                    >
                      <div
                        className={`rounded-full flex items-center justify-center ${bg} ${border} ${text} cursor-pointer transition-transform hover:scale-105 ${isSelected ? 'ring-4 ring-gray-800' : ''}`}
                        style={bubbleSize}
                        onClick={() => onSelectTarget?.(target)}
                        title={`${target.muscle?.name || 'Muscle'} - ${target.activationPercentage}% activation`}
                      >
                        <div className="text-center px-1">
                          <div className="text-xs font-bold truncate max-w-full">
                            {target.muscle?.commonName ||
                              target.muscle?.name?.split(' ')[0] ||
                              '?'}
                          </div>
                          <div className="text-xs">
                            {target.activationPercentage}%
                          </div>
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-center text-gray-600 max-w-[80px] truncate">
                        {target.muscle?.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm font-medium text-gray-700 mb-2">Legend</div>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
            <span className="text-xs text-gray-600">Primary</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-xs text-gray-600">Secondary</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
            <span className="text-xs text-gray-600">Synergist</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
            <span className="text-xs text-gray-600">Stabilizer</span>
          </div>
          <div className="flex items-center ml-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gray-400 mr-1"></div>
              <span className="text-xs text-gray-600">
                Small bubble = Low activation
              </span>
            </div>
            <div className="mx-2">→</div>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-gray-400 mr-1"></div>
              <span className="text-xs text-gray-600">
                Large bubble = High activation
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MuscleTargetingVisualization;
