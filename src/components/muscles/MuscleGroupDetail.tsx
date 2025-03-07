// src/components/muscles/MuscleGroupDetail.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, ArrowRight, Layers } from 'lucide-react';
import { MuscleGroup } from '../../api/muscleService';
import MuscleGroupBreadcrumb from './MuscleGroupBreadcrumb';

interface MuscleGroupDetailProps {
  group: MuscleGroup;
  ancestors?: MuscleGroup[];
  children?: MuscleGroup[];
}

const MuscleGroupDetail: React.FC<MuscleGroupDetailProps> = ({
  group,
  ancestors = [],
  children = [],
}) => {
  const categoryColors = {
    UPPER_BODY: 'bg-blue-50 border-blue-200',
    LOWER_BODY: 'bg-green-50 border-green-200',
    CORE: 'bg-purple-50 border-purple-200',
  };

  const categoryClass =
    categoryColors[group.category as keyof typeof categoryColors] || '';

  return (
    <div className={`rounded-lg border overflow-hidden ${categoryClass}`}>
      <div className="p-6">
        <MuscleGroupBreadcrumb
          group={group}
          ancestors={ancestors}
          className="mb-4 text-gray-600"
          linked
        />

        <h2 className="text-2xl font-bold text-gray-900 mb-2">{group.name}</h2>

        <div className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-white mb-4">
          {group.category.replace('_', ' ')}
        </div>

        {group.description && (
          <div className="text-gray-700 mb-6">
            <p>{group.description}</p>
          </div>
        )}

        {/* Child groups section */}
        {children.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <Layers className="h-5 w-5 mr-2 text-gray-500" />
              Child Groups
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {children.map((child) => (
                <Link
                  key={child.id}
                  to={`/muscles/groups?group=${child.id}`}
                  className="flex items-center p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {child.name}
                    </div>
                    {child.muscles && (
                      <div className="text-sm text-gray-500">
                        {child.muscles.length} muscles
                      </div>
                    )}
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Muscles in this group section */}
        {group.muscles && group.muscles.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <Dumbbell className="h-5 w-5 mr-2 text-gray-500" />
              Muscles in this Group
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {group.muscles.map((muscle) => (
                <Link
                  key={muscle.id}
                  to={`/muscles/${muscle.id}`}
                  className="flex items-center p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {muscle.name}
                    </div>
                    {muscle.commonName && (
                      <div className="text-sm text-gray-500">
                        {muscle.commonName}
                      </div>
                    )}
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {group.muscles &&
          group.muscles.length === 0 &&
          children.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>This group doesn't contain any muscles or child groups yet.</p>
            </div>
          )}
      </div>
    </div>
  );
};

export default MuscleGroupDetail;
