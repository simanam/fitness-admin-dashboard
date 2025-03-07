// src/pages/exercises/tabs/ExerciseOverview.tsx
import React from 'react';
import { Exercise } from '../../../api/exerciseService';
import { Clock, Calendar, Info, Tag, Users } from 'lucide-react';

interface ExerciseOverviewProps {
  exercise: Exercise;
  setExercise: React.Dispatch<React.SetStateAction<Exercise | null>>;
}

const ExerciseOverview: React.FC<ExerciseOverviewProps> = ({
  exercise,
  setExercise,
}) => {
  // Format the date in a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get icon based on movement pattern
  const getMovementPatternIcon = (pattern: string) => {
    switch (pattern) {
      case 'SQUAT':
        return '🦵';
      case 'HINGE':
        return '🔄';
      case 'PUSH':
        return '👐';
      case 'PULL':
        return '💪';
      case 'CARRY':
        return '🏋️';
      case 'ROTATION':
        return '🔄';
      case 'LUNGE':
        return '🚶';
      case 'CORE':
        return '⭐';
      default:
        return '🔄';
    }
  };

  return (
    <div className="space-y-8">
      {/* Description */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
          <Info className="h-5 w-5 mr-2 text-gray-500" />
          Description
        </h3>
        {exercise.description ? (
          <div className="prose max-w-none">
            <p className="text-gray-700">{exercise.description}</p>
          </div>
        ) : (
          <p className="text-gray-500 italic">No description provided.</p>
        )}
      </div>

      {/* Technical Details */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
          <Tag className="h-5 w-5 mr-2 text-gray-500" />
          Technical Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">
              Difficulty
            </h4>
            <p className="text-gray-900">{exercise.difficulty}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">
              Movement Pattern
            </h4>
            <p className="text-gray-900 flex items-center">
              <span className="mr-2">
                {getMovementPatternIcon(exercise.movement_pattern)}
              </span>
              {exercise.movement_pattern}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">
              Mechanics
            </h4>
            <p className="text-gray-900">{exercise.mechanics}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Force</h4>
            <p className="text-gray-900">{exercise.force}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">
              Equipment Required
            </h4>
            <p className="text-gray-900">
              {exercise.equipment_required ? 'Yes' : 'No'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">
              Bilateral
            </h4>
            <p className="text-gray-900">{exercise.bilateral ? 'Yes' : 'No'}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">
              Plane of Motion
            </h4>
            <p className="text-gray-900">{exercise.plane_of_motion}</p>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-gray-500" />
          Metadata
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Created</p>
              <p className="text-gray-900">{formatDate(exercise.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Last Updated</p>
              <p className="text-gray-900">{formatDate(exercise.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions - Placeholder, would typically come from extended exercise data */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
          <Users className="h-5 w-5 mr-2 text-gray-500" />
          Instructions
        </h3>
        {exercise.instructions ? (
          <div className="prose max-w-none">
            <div className="space-y-4">
              {/* If we had structured instructions, we'd map through them here */}
              <p className="text-gray-700">{exercise.instructions}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 italic">No instructions provided.</p>
        )}
      </div>
    </div>
  );
};

export default ExerciseOverview;
