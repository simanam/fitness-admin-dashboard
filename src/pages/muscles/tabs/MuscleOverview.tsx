// src/pages/muscles/tabs/MuscleOverview.tsx
import React from 'react';
import { Info, Layers, Calendar } from 'lucide-react';
import { Muscle } from '../../../api/muscleService';

interface MuscleOverviewProps {
  muscle: Muscle;
}

const MuscleOverview: React.FC<MuscleOverviewProps> = ({ muscle }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Description */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
          <Info className="h-5 w-5 mr-2 text-gray-500" />
          Description
        </h3>
        {muscle.description ? (
          <div className="prose max-w-none">
            <p className="text-gray-700">{muscle.description}</p>
          </div>
        ) : (
          <p className="text-gray-500 italic">No description provided.</p>
        )}
      </div>

      {/* Muscle Group Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
          <Layers className="h-5 w-5 mr-2 text-gray-500" />
          Muscle Group Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Group</h4>
            <p className="text-gray-900">
              {muscle.muscleGroup?.name || 'None'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Category</h4>
            <p className="text-gray-900">
              {muscle.muscleGroup?.category.replace('_', ' ') || 'None'}
            </p>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-gray-500" />
          Metadata
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Created</p>
              <p className="text-gray-900">
                {muscle.createdAt ? formatDate(muscle.createdAt) : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Last Updated</p>
              <p className="text-gray-900">
                {muscle.updatedAt ? formatDate(muscle.updatedAt) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MuscleOverview;
