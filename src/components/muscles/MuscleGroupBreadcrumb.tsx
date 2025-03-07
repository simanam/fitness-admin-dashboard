// src/components/muscles/MuscleGroupBreadcrumb.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { MuscleGroup } from '../../api/muscleService';

interface MuscleGroupBreadcrumbProps {
  group: MuscleGroup;
  ancestors?: MuscleGroup[];
  className?: string;
  linked?: boolean;
}

const MuscleGroupBreadcrumb: React.FC<MuscleGroupBreadcrumbProps> = ({
  group,
  ancestors = [],
  className = '',
  linked = false,
}) => {
  // Combine ancestors and current group to show the full path
  const path = [...ancestors, group];

  return (
    <div className={`flex items-center flex-wrap text-sm ${className}`}>
      {path.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 mx-1 text-gray-400 flex-shrink-0" />
          )}

          {linked && index < path.length - 1 ? (
            <Link
              to={`/muscles/groups?group=${item.id}`}
              className="text-gray-600 hover:text-gray-900 hover:underline"
            >
              {item.name}
            </Link>
          ) : (
            <span className={index === path.length - 1 ? 'font-medium' : ''}>
              {item.name}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default MuscleGroupBreadcrumb;
