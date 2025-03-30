// src/components/exercises/MuscleTargetList.tsx
import { Edit, Trash2, Layers } from 'lucide-react';
import { MuscleTarget } from '../../api/muscleService';

interface MuscleTargetListProps {
  title: string;
  description: string;
  targets: MuscleTarget[];
  onEdit: (target: MuscleTarget) => void;
  onDelete: (target: MuscleTarget) => void;
  role: 'primary' | 'secondary' | 'synergist' | 'stabilizer'; // Updated case and enum values
}

const MuscleTargetList = ({
  title,
  description,
  targets,
  onEdit,
  onDelete,
  role,
}: MuscleTargetListProps) => {
  // Get styling based on role
  const getRoleStyles = () => {
    switch (role) {
      case 'primary':
        return {
          headerBg: 'bg-red-50',
          headerBorder: 'border-red-100',
          headerText: 'text-red-800',
          icon: <Layers className="h-5 w-5 text-red-600" />,
        };
      case 'secondary':
        return {
          headerBg: 'bg-blue-50',
          headerBorder: 'border-blue-100',
          headerText: 'text-blue-800',
          icon: <Layers className="h-5 w-5 text-blue-600" />,
        };
      case 'synergist':
        return {
          headerBg: 'bg-green-50',
          headerBorder: 'border-green-100',
          headerText: 'text-green-800',
          icon: <Layers className="h-5 w-5 text-green-600" />,
        };
      case 'stabilizer':
        return {
          headerBg: 'bg-purple-50',
          headerBorder: 'border-purple-100',
          headerText: 'text-purple-800',
          icon: <Layers className="h-5 w-5 text-purple-600" />,
        };
      default:
        return {
          headerBg: 'bg-gray-50',
          headerBorder: 'border-gray-100',
          headerText: 'text-gray-800',
          icon: <Layers className="h-5 w-5 text-gray-600" />,
        };
    }
  };
  const { headerBg, headerBorder, headerText, icon } = getRoleStyles();

  // If no targets, don't render the section
  if (targets.length === 0) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className={`px-4 py-3 ${headerBg} border-b ${headerBorder}`}>
        <div className="flex items-center">
          {icon}
          <h4 className={`ml-2 font-medium ${headerText}`}>{title}</h4>
        </div>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </div>

      <div className="divide-y divide-gray-100">
        {targets.map((target) => (
          <div
            key={target.id}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center">
                  <h5 className="font-medium text-gray-900">
                    {target.muscle?.name}
                  </h5>
                  {target.muscle?.commonName && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({target.muscle.commonName})
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-center">
                  <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        role === 'primary'
                          ? 'bg-red-500'
                          : role === 'secondary'
                            ? 'bg-blue-500'
                            : role === 'synergist'
                              ? 'bg-green-500'
                              : 'bg-purple-500'
                      }`}
                      style={{ width: `${target.activationPercentage}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {target.activationPercentage}%
                  </span>
                </div>

                {target.muscle?.muscleGroup && (
                  <div className="mt-1 text-sm text-gray-500">
                    Group: {target.muscle.muscleGroup.name}
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(target)}
                  className="p-1 text-gray-400 hover:text-gray-700 rounded"
                  title="Edit target"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(target)}
                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                  title="Remove target"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MuscleTargetList;
