// src/components/exercises/ProgressionPathVisualization.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  CornerUpRight,
  CornerDownRight,
} from 'lucide-react';
import {
  ProgressionPath,
  ProgressionRelationship,
} from '../../api/relationshipService';
import { Exercise } from '../../api/exerciseService';

interface ProgressionPathVisualizationProps {
  progressionPath: ProgressionPath;
  currentExercise: Exercise;
  onDeleteRelationship?: (relationship: ProgressionRelationship) => void;
  onEditRelationship?: (relationship: ProgressionRelationship) => void;
}

const ProgressionPathVisualization: React.FC<
  ProgressionPathVisualizationProps
> = ({
  progressionPath,
  currentExercise,
  onDeleteRelationship,
  onEditRelationship,
}) => {
  const [expandedGroups, setExpandedGroups] = useState<{
    easier: boolean;
    harder: boolean;
  }>({
    easier: true,
    harder: true,
  });

  // Group exercises by difficulty change
  const groupByDifficulty = (
    items: ProgressionRelationship[],
    isEasier: boolean
  ) => {
    const groups: { [key: number]: ProgressionRelationship[] } = {};

    items.forEach((item) => {
      const diffKey = Math.abs(item.difficultyChange);
      if (!groups[diffKey]) {
        groups[diffKey] = [];
      }
      groups[diffKey].push(item);
    });

    // Convert to array and sort
    return Object.entries(groups)
      .map(([diff, items]) => ({
        difficulty: parseInt(diff),
        items,
        isEasier,
      }))
      .sort((a, b) =>
        isEasier ? a.difficulty - b.difficulty : b.difficulty - a.difficulty
      );
  };

  const easierGroups = groupByDifficulty(progressionPath.easier, true);
  const harderGroups = groupByDifficulty(progressionPath.harder, false);

  const toggleGroup = (type: 'easier' | 'harder') => {
    setExpandedGroups((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // Different intensity colors based on difficulty
  const getDifficultyColor = (difficulty: number, isEasier: boolean) => {
    if (isEasier) {
      switch (difficulty) {
        case 3:
          return 'bg-green-100 border-green-200 text-green-800';
        case 2:
          return 'bg-green-50 border-green-100 text-green-700';
        case 1:
          return 'bg-blue-50 border-blue-100 text-blue-700';
        default:
          return 'bg-gray-50 border-gray-100 text-gray-700';
      }
    } else {
      switch (difficulty) {
        case 3:
          return 'bg-red-100 border-red-200 text-red-800';
        case 2:
          return 'bg-red-50 border-red-100 text-red-700';
        case 1:
          return 'bg-orange-50 border-orange-100 text-orange-700';
        default:
          return 'bg-gray-50 border-gray-100 text-gray-700';
      }
    }
  };

  // Get the correct exercise from a relationship based on direction
  const getExerciseFromRelationship = (
    relationship: ProgressionRelationship,
    isEasier: boolean
  ) => {
    return isEasier ? relationship.baseExercise : relationship.relatedExercise;
  };

  const renderCurrentExercise = () => (
    <div className="relative flex justify-center my-4">
      <div className="border-2 border-gray-900 rounded-lg p-4 bg-white shadow-md w-64 z-10">
        <h3 className="font-bold text-lg text-gray-900">
          {currentExercise.name}
        </h3>
        <div className="mt-1 text-sm text-gray-600 capitalize">
          {currentExercise.difficulty.toLowerCase()} difficulty
        </div>
        <div className="mt-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full inline-block">
          Current exercise
        </div>
      </div>

      {/* Vertical connecting lines */}
      {progressionPath.easier.length > 0 && (
        <div className="absolute top-1/2 -left-4 w-4 h-8 border-l-2 border-b-2 border-gray-300 rounded-bl-lg -mt-4"></div>
      )}

      {progressionPath.harder.length > 0 && (
        <div className="absolute top-1/2 -right-4 w-4 h-8 border-r-2 border-b-2 border-gray-300 rounded-br-lg -mt-4"></div>
      )}
    </div>
  );

  const renderExerciseGroup = (group: {
    difficulty: number;
    items: ProgressionRelationship[];
    isEasier: boolean;
  }) => {
    const { difficulty, items, isEasier } = group;
    const colorClass = getDifficultyColor(difficulty, isEasier);

    return (
      <div
        key={`${isEasier ? 'easier' : 'harder'}-${difficulty}`}
        className="mb-4"
      >
        <div
          className={`border rounded-lg ${colorClass} p-2 mb-2 text-sm font-medium flex items-center justify-between`}
        >
          <div className="flex items-center">
            {isEasier ? (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                <span>
                  Easier by {difficulty} {difficulty === 1 ? 'level' : 'levels'}
                </span>
              </>
            ) : (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                <span>
                  Harder by {difficulty} {difficulty === 1 ? 'level' : 'levels'}
                </span>
              </>
            )}
          </div>
          <div className="text-xs bg-white bg-opacity-70 px-2 py-0.5 rounded-full">
            {items.length} {items.length === 1 ? 'exercise' : 'exercises'}
          </div>
        </div>

        <div className="space-y-2">
          {items.map((item) => {
            const exercise = getExerciseFromRelationship(item, isEasier);
            return (
              <div key={item.id} className="flex items-center">
                <div className="flex-shrink-0 mr-2">
                  {isEasier ? (
                    <CornerDownRight className="h-4 w-4 text-gray-400" />
                  ) : (
                    <CornerUpRight className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <div className="flex-grow bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-start shadow-sm hover:shadow-md transition-shadow">
                  <div>
                    <Link
                      to={`/exercises/${exercise.id}`}
                      className="font-medium text-gray-900 hover:text-black hover:underline"
                    >
                      {exercise.name}
                    </Link>
                    <div className="mt-1 text-xs text-gray-500 capitalize">
                      {exercise.difficulty.toLowerCase()} difficulty
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {onEditRelationship && (
                      <button
                        onClick={() => onEditRelationship(item)}
                        className="text-gray-400 hover:text-blue-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                    )}
                    {onDeleteRelationship && (
                      <button
                        onClick={() => onDeleteRelationship(item)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="progression-path-visualization">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-x-8 gap-y-4">
        {/* Left side - Easier exercises */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 rounded-lg p-4 h-full">
            <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
              <h3 className="font-medium text-gray-900 flex items-center">
                <ArrowDown className="h-5 w-5 text-green-600 mr-2" />
                Easier Progressions
              </h3>
              <button
                onClick={() => toggleGroup('easier')}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                {expandedGroups.easier ? 'Collapse' : 'Expand'}
                {expandedGroups.easier ? (
                  <ChevronUp className="h-4 w-4 ml-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-1" />
                )}
              </button>
            </div>

            {expandedGroups.easier ? (
              progressionPath.easier.length > 0 ? (
                <div>
                  {easierGroups.map((group) => renderExerciseGroup(group))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
                  <ArrowDown className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  <p>No easier progressions defined</p>
                </div>
              )
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>{progressionPath.easier.length} easier exercises hidden</p>
              </div>
            )}
          </div>
        </div>

        {/* Middle - Current exercise */}
        <div className="lg:col-span-1 flex items-center justify-center">
          {renderCurrentExercise()}
        </div>

        {/* Right side - Harder exercises */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 rounded-lg p-4 h-full">
            <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
              <h3 className="font-medium text-gray-900 flex items-center">
                <ArrowUp className="h-5 w-5 text-red-600 mr-2" />
                Harder Progressions
              </h3>
              <button
                onClick={() => toggleGroup('harder')}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                {expandedGroups.harder ? 'Collapse' : 'Expand'}
                {expandedGroups.harder ? (
                  <ChevronUp className="h-4 w-4 ml-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-1" />
                )}
              </button>
            </div>

            {expandedGroups.harder ? (
              progressionPath.harder.length > 0 ? (
                <div>
                  {harderGroups.map((group) => renderExerciseGroup(group))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
                  <ArrowUp className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  <p>No harder progressions defined</p>
                </div>
              )
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>{progressionPath.harder.length} harder exercises hidden</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressionPathVisualization;
