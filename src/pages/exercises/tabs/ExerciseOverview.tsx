// src/pages/exercises/tabs/ExerciseOverview.tsx
import type { FC } from 'react';
import type { Exercise } from '../../../api/exerciseService';
import {
  Clock,
  Calendar,
  Info,
  Tag,
  Users,
  Check,
  PlayCircle,
  Wind,
  AlertCircle,
} from 'lucide-react';

interface ExerciseOverviewProps {
  exercise: Exercise & {
    instructions?: string;
  };
}

const ExerciseOverview: FC<ExerciseOverviewProps> = ({ exercise }) => {
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
    switch (pattern.toUpperCase()) {
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

  // Check if form_points has any content
  const hasFormPoints =
    exercise.form_points &&
    ((exercise.form_points.setup && exercise.form_points.setup.length > 0) ||
      (exercise.form_points.execution &&
        exercise.form_points.execution.length > 0) ||
      (exercise.form_points.breathing &&
        exercise.form_points.breathing.length > 0) ||
      (exercise.form_points.alignment &&
        exercise.form_points.alignment.length > 0));

  // Generate unique keys for list items
  const generateKey = (prefix: string, index: number, value: string) =>
    `${prefix}-${index}-${value.slice(0, 20)}`;

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
            <p className="text-gray-900 capitalize">{exercise.difficulty}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">
              Movement Pattern
            </h4>
            <p className="text-gray-900 flex items-center capitalize">
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
            <p className="text-gray-900 capitalize">{exercise.mechanics}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Force</h4>
            <p className="text-gray-900 capitalize">{exercise.force}</p>
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
            <p className="text-gray-900 capitalize">
              {exercise.plane_of_motion}
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
          <Users className="h-5 w-5 mr-2 text-gray-500" />
          Instructions
        </h3>

        {hasFormPoints ? (
          <div className="space-y-6">
            {/* Setup Instructions */}
            {exercise.form_points?.setup &&
              exercise.form_points.setup.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-blue-800 mb-2 flex items-center">
                    <Check className="h-4 w-4 mr-2 text-blue-700" />
                    Setup
                  </h4>
                  <ol className="list-decimal pl-5 space-y-2 text-blue-900">
                    {exercise.form_points.setup.map((step, index) => (
                      <li
                        key={generateKey('setup', index, step)}
                        className="text-blue-800"
                      >
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

            {/* Execution Instructions */}
            {exercise.form_points?.execution &&
              exercise.form_points.execution.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-800 mb-2 flex items-center">
                    <PlayCircle className="h-4 w-4 mr-2 text-gray-700" />
                    Execution
                  </h4>
                  <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                    {exercise.form_points.execution.map((step, index) => (
                      <li key={generateKey('execution', index, step)}>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

            {/* Breathing Instructions */}
            {exercise.form_points?.breathing &&
              exercise.form_points.breathing.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-green-800 mb-2 flex items-center">
                    <Wind className="h-4 w-4 mr-2 text-green-700" />
                    Breathing
                  </h4>
                  <ul className="list-disc pl-5 space-y-2 text-green-800">
                    {exercise.form_points.breathing.map((step, index) => (
                      <li key={generateKey('breathing', index, step)}>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Alignment Instructions */}
            {exercise.form_points?.alignment &&
              exercise.form_points.alignment.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-yellow-800 mb-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-yellow-700" />
                    Alignment
                  </h4>
                  <ul className="list-disc pl-5 space-y-2 text-yellow-800">
                    {exercise.form_points.alignment.map((step, index) => (
                      <li key={generateKey('alignment', index, step)}>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        ) : exercise.instructions ? (
          // Fallback to raw instructions text if form_points is not available
          <div className="prose max-w-none bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 whitespace-pre-line">
              {exercise.instructions}
            </p>
          </div>
        ) : (
          <p className="text-gray-500 italic">No instructions provided.</p>
        )}
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
    </div>
  );
};

export default ExerciseOverview;
