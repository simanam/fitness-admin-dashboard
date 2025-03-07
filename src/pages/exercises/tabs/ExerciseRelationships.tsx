// src/pages/exercises/tabs/ExerciseRelationships.tsx
import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Link as LinkIcon,
} from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import ConfirmationDialog from '../../../components/ui/confirmation-dialog';
import Modal from '../../../components/ui/modal';
import { Select } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { Checkbox } from '../../../components/ui/checkbox';
import EmptyState from '../../../components/ui/empty-state';
import exerciseService, { Exercise } from '../../../api/exerciseService';
import relationshipService, {
  ExerciseRelationship,
  ProgressionPath,
} from '../../../api/relationshipService';

interface ExerciseRelationshipsProps {
  exerciseId: string;
  exercise: Exercise;
}

const ExerciseRelationships = ({
  exerciseId,
  exercise,
}: ExerciseRelationshipsProps) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [relationships, setRelationships] = useState<ExerciseRelationship[]>(
    []
  );
  const [progressionPath, setProgressionPath] =
    useState<ProgressionPath | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRelationship, setSelectedRelationship] =
    useState<ExerciseRelationship | null>(null);

  // Form state
  const [relatedExerciseId, setRelatedExerciseId] = useState<string>('');
  const [relationshipType, setRelationshipType] = useState<
    'PROGRESSION' | 'VARIATION' | 'ALTERNATIVE'
  >('VARIATION');
  const [difficultyChange, setDifficultyChange] = useState<number>(0);
  const [bidirectional, setBidirectional] = useState<boolean>(false);
  const [modificationDetails, setModificationDetails] = useState<{
    setupChanges: string;
    techniqueChanges: string;
    targetMuscleImpact: string;
  }>({
    setupChanges: '',
    techniqueChanges: '',
    targetMuscleImpact: '',
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch relationships, progression path, and exercises for selection
        const [relationshipsData, progressionData, exercisesData] =
          await Promise.all([
            relationshipService.getExerciseRelationships(exerciseId),
            relationshipService.getProgressionPath(exerciseId),
            exerciseService.getExercises({
              status: 'PUBLISHED',
              per_page: 100,
            }),
          ]);

        setRelationships(relationshipsData);
        setProgressionPath(progressionData);

        // Filter out the current exercise and already related exercises
        const relatedIds = [
          ...relationshipsData.map((r) =>
            r.baseExerciseId === exerciseId
              ? r.relatedExerciseId
              : r.baseExerciseId
          ),
          exerciseId,
        ];

        setExercises(
          exercisesData.data.filter((e) => !relatedIds.includes(e.id))
        );
      } catch (error) {
        console.error('Error fetching relationships data:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load relationships data',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [exerciseId]);

  // Reset form state
  const resetForm = () => {
    setRelatedExerciseId('');
    setRelationshipType('VARIATION');
    setDifficultyChange(0);
    setBidirectional(false);
    setModificationDetails({
      setupChanges: '',
      techniqueChanges: '',
      targetMuscleImpact: '',
    });
  };

  // Handle relationship creation
  const handleAddRelationship = async () => {
    if (!relatedExerciseId) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please select an exercise',
      });
      return;
    }

    try {
      const newRelationship = await relationshipService.createRelationship({
        baseExerciseId: exerciseId,
        relatedExerciseId: relatedExerciseId,
        relationshipType: relationshipType,
        difficultyChange:
          relationshipType === 'PROGRESSION' ? difficultyChange : 0,
        bidirectional: bidirectional,
        modificationDetails:
          relationshipType !== 'PROGRESSION' ? modificationDetails : undefined,
      });

      // Find the related exercise for display
      const relatedExercise = exercises.find((e) => e.id === relatedExerciseId);

      if (relatedExercise && newRelationship) {
        // Add related exercise info to the relationship
        const completeRelationship = {
          ...newRelationship,
          baseExercise: exercise,
          relatedExercise: relatedExercise,
        };

        setRelationships([...relationships, completeRelationship]);

        // If it's a progression relationship, refresh the progression path
        if (relationshipType === 'PROGRESSION') {
          const newProgressionPath =
            await relationshipService.getProgressionPath(exerciseId);
          setProgressionPath(newProgressionPath);
        }

        // Remove the related exercise from the available options
        setExercises(exercises.filter((e) => e.id !== relatedExerciseId));
      }

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Relationship added successfully',
      });

      resetForm();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding relationship:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to add relationship',
      });
    }
  };

  // Handle relationship deletion
  const handleDeleteRelationship = async () => {
    if (!selectedRelationship) return;

    try {
      await relationshipService.deleteRelationship(selectedRelationship.id);

      // Add the related exercise back to the available options
      const relatedId =
        selectedRelationship.baseExerciseId === exerciseId
          ? selectedRelationship.relatedExerciseId
          : selectedRelationship.baseExerciseId;

      const relatedExercise =
        selectedRelationship.baseExerciseId === exerciseId
          ? selectedRelationship.relatedExercise
          : selectedRelationship.baseExercise;

      if (relatedExercise) {
        setExercises([...exercises, relatedExercise]);
      }

      // Remove from relationships
      setRelationships(
        relationships.filter((r) => r.id !== selectedRelationship.id)
      );

      // If it's a progression relationship, refresh the progression path
      if (selectedRelationship.relationshipType === 'PROGRESSION') {
        const newProgressionPath =
          await relationshipService.getProgressionPath(exerciseId);
        setProgressionPath(newProgressionPath);
      }

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Relationship removed successfully',
      });

      setSelectedRelationship(null);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting relationship:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to remove relationship',
      });
    }
  };

  // Confirm delete
  const confirmDelete = (relationship: ExerciseRelationship) => {
    setSelectedRelationship(relationship);
    setShowDeleteDialog(true);
  };

  // Group relationships by type for display
  const progressionRelationships = relationships.filter(
    (r) => r.relationshipType === 'PROGRESSION'
  );
  const variationRelationships = relationships.filter(
    (r) => r.relationshipType === 'VARIATION'
  );
  const alternativeRelationships = relationships.filter(
    (r) => r.relationshipType === 'ALTERNATIVE'
  );

  // Get the related exercise object for display
  const getRelatedExercise = (relationship: ExerciseRelationship) => {
    if (relationship.baseExerciseId === exerciseId) {
      return relationship.relatedExercise;
    } else {
      return relationship.baseExercise;
    }
  };

  // Get relationship direction indicator
  const getDirectionIndicator = (relationship: ExerciseRelationship) => {
    // If bidirectional or it's a variation (which are typically bidirectional)
    if (
      relationship.bidirectional ||
      relationship.relationshipType === 'VARIATION'
    ) {
      return '↔️';
    }
    // If current exercise is the base, show outgoing direction
    else if (relationship.baseExerciseId === exerciseId) {
      return '→';
    }
    // Otherwise show incoming direction
    else {
      return '←';
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with title and add button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Relationships</h3>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={exercises.length === 0}
          className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md ${
            exercises.length === 0
              ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-500'
              : 'text-gray-700 bg-white hover:bg-gray-50'
          } focus:outline-none`}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Relationship
        </button>
      </div>

      {/* Display progression path if available */}
      {progressionPath &&
        (progressionPath.easier.length > 0 ||
          progressionPath.harder.length > 0) && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-6">
            <h4 className="font-medium text-gray-900 mb-4">Progression Path</h4>

            <div className="flex flex-col-reverse md:flex-row gap-4">
              {/* Easier exercises */}
              <div className="flex-1">
                <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <ChevronDown className="h-4 w-4 text-blue-500 mr-1" />
                  Easier Variations
                </h5>

                {progressionPath.easier.length > 0 ? (
                  <ul className="space-y-2">
                    {progressionPath.easier.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between border border-gray-200 rounded-lg p-3 bg-white"
                      >
                        <div>
                          <div className="font-medium">
                            {item.baseExercise?.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {/* Show difficulty change from current exercise */}
                            {item.difficultyChange !== 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {item.difficultyChange > 0 ? '+' : ''}
                                {item.difficultyChange} difficulty
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => confirmDelete(item)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg p-3 bg-white text-center">
                    No easier exercises defined
                  </div>
                )}
              </div>

              {/* Current exercise */}
              <div className="flex items-center justify-center">
                <div className="border-2 border-black rounded-lg p-3 px-4 bg-white">
                  <div className="font-medium">{exercise.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Current exercise
                  </div>
                </div>
              </div>

              {/* Harder exercises */}
              <div className="flex-1">
                <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <ChevronUp className="h-4 w-4 text-red-500 mr-1" />
                  Harder Variations
                </h5>

                {progressionPath.harder.length > 0 ? (
                  <ul className="space-y-2">
                    {progressionPath.harder.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between border border-gray-200 rounded-lg p-3 bg-white"
                      >
                        <div>
                          <div className="font-medium">
                            {item.relatedExercise?.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {item.difficultyChange !== 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                {item.difficultyChange > 0 ? '+' : ''}
                                {item.difficultyChange} difficulty
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => confirmDelete(item)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg p-3 bg-white text-center">
                    No harder exercises defined
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Relationships list by type */}
      {relationships.length > 0 ? (
        <div className="space-y-6">
          {/* Variations */}
          {variationRelationships.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                Variations
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {variationRelationships.map((relationship) => {
                  const relatedExercise = getRelatedExercise(relationship);
                  return (
                    <div
                      key={relationship.id}
                      className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-900 flex items-center">
                            <span className="text-gray-500 mr-2">
                              {getDirectionIndicator(relationship)}
                            </span>
                            {relatedExercise?.name}
                          </h5>

                          {relationship.modificationDetails && (
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              {relationship.modificationDetails
                                .setupChanges && (
                                <p>
                                  <span className="font-medium">Setup:</span>{' '}
                                  {
                                    relationship.modificationDetails
                                      .setupChanges
                                  }
                                </p>
                              )}
                              {relationship.modificationDetails
                                .techniqueChanges && (
                                <p>
                                  <span className="font-medium">
                                    Technique:
                                  </span>{' '}
                                  {
                                    relationship.modificationDetails
                                      .techniqueChanges
                                  }
                                </p>
                              )}
                              {relationship.modificationDetails
                                .targetMuscleImpact && (
                                <p>
                                  <span className="font-medium">
                                    Muscle Impact:
                                  </span>{' '}
                                  {
                                    relationship.modificationDetails
                                      .targetMuscleImpact
                                  }
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => confirmDelete(relationship)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Alternatives */}
          {alternativeRelationships.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                Alternatives
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alternativeRelationships.map((relationship) => {
                  const relatedExercise = getRelatedExercise(relationship);
                  return (
                    <div
                      key={relationship.id}
                      className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-900 flex items-center">
                            <span className="text-gray-500 mr-2">
                              {getDirectionIndicator(relationship)}
                            </span>
                            {relatedExercise?.name}
                          </h5>

                          {relationship.modificationDetails && (
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              {relationship.modificationDetails
                                .setupChanges && (
                                <p>
                                  <span className="font-medium">Setup:</span>{' '}
                                  {
                                    relationship.modificationDetails
                                      .setupChanges
                                  }
                                </p>
                              )}
                              {relationship.modificationDetails
                                .techniqueChanges && (
                                <p>
                                  <span className="font-medium">
                                    Technique:
                                  </span>{' '}
                                  {
                                    relationship.modificationDetails
                                      .techniqueChanges
                                  }
                                </p>
                              )}
                              {relationship.modificationDetails
                                .targetMuscleImpact && (
                                <p>
                                  <span className="font-medium">
                                    Muscle Impact:
                                  </span>{' '}
                                  {
                                    relationship.modificationDetails
                                      .targetMuscleImpact
                                  }
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => confirmDelete(relationship)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={<LinkIcon className="h-12 w-12 text-gray-400" />}
          title="No relationships defined"
          description="Create relationships between this exercise and other exercises to build progression paths, variations, and alternatives."
          action={
            <button
              onClick={() => setShowAddModal(true)}
              disabled={exercises.length === 0}
              className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md ${
                exercises.length === 0
                  ? 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-700'
                  : 'text-white bg-black hover:bg-gray-800'
              } focus:outline-none`}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Relationship
            </button>
          }
        />
      )}

      {/* Add relationship modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          resetForm();
          setShowAddModal(false);
        }}
        title="Add Relationship"
        size="md"
        footer={
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(false);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddRelationship}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Add Relationship
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Exercise selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Related Exercise
            </label>
            <Select
              options={[
                { value: '', label: 'Select an exercise' },
                ...exercises.map((e) => ({
                  value: e.id,
                  label: `${e.name} (${e.difficulty})`,
                })),
              ]}
              value={relatedExerciseId}
              onChange={(e) => setRelatedExerciseId(e.target.value)}
            />
            {exercises.length === 0 && (
              <p className="mt-1 text-sm text-yellow-600">
                All published exercises are already related to this exercise.
              </p>
            )}
          </div>

          {/* Relationship type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship Type
            </label>
            <Select
              options={[
                {
                  value: 'PROGRESSION',
                  label: 'Progression - Part of a difficulty progression',
                },
                {
                  value: 'VARIATION',
                  label: 'Variation - Similar movement pattern',
                },
                {
                  value: 'ALTERNATIVE',
                  label: 'Alternative - Substitute exercise',
                },
              ]}
              value={relationshipType}
              onChange={(e) =>
                setRelationshipType(
                  e.target.value as 'PROGRESSION' | 'VARIATION' | 'ALTERNATIVE'
                )
              }
            />
          </div>

          {/* Conditional fields based on relationship type */}
          {relationshipType === 'PROGRESSION' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Change
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() =>
                    setDifficultyChange(Math.max(-3, difficultyChange - 1))
                  }
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  -
                </button>
                <span className="px-4 py-1 border border-gray-300 rounded-md w-12 text-center">
                  {difficultyChange > 0
                    ? `+${difficultyChange}`
                    : difficultyChange}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setDifficultyChange(Math.min(3, difficultyChange + 1))
                  }
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  +
                </button>
                <span className="text-sm text-gray-500 ml-2">
                  {difficultyChange > 0
                    ? 'Harder than current exercise'
                    : difficultyChange < 0
                      ? 'Easier than current exercise'
                      : 'Same difficulty'}
                </span>
              </div>
            </div>
          )}

          {/* Bidirectional checkbox (for non-progression relationships) */}
          {relationshipType !== 'PROGRESSION' && (
            <div>
              <Checkbox
                id="bidirectional"
                checked={bidirectional}
                onChange={(e) => setBidirectional(e.target.checked)}
                label="Bidirectional relationship"
                helperText="If checked, the relationship works both ways"
              />
            </div>
          )}

          {/* Modification details for non-progression relationships */}
          {relationshipType !== 'PROGRESSION' && (
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-700">
                Modification Details
              </h5>

              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Setup Changes
                </label>
                <Textarea
                  value={modificationDetails.setupChanges}
                  onChange={(e) =>
                    setModificationDetails({
                      ...modificationDetails,
                      setupChanges: e.target.value,
                    })
                  }
                  placeholder="How does the setup differ between these exercises?"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Technique Changes
                </label>
                <Textarea
                  value={modificationDetails.techniqueChanges}
                  onChange={(e) =>
                    setModificationDetails({
                      ...modificationDetails,
                      techniqueChanges: e.target.value,
                    })
                  }
                  placeholder="How does the execution technique differ?"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Target Muscle Impact
                </label>
                <Textarea
                  value={modificationDetails.targetMuscleImpact}
                  onChange={(e) =>
                    setModificationDetails({
                      ...modificationDetails,
                      targetMuscleImpact: e.target.value,
                    })
                  }
                  placeholder="How does this change affect the muscles targeted?"
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedRelationship(null);
        }}
        onConfirm={handleDeleteRelationship}
        title="Remove Relationship"
        message={
          <p>
            Are you sure you want to remove the relationship with{' '}
            <span className="font-medium">
              {selectedRelationship &&
                getRelatedExercise(selectedRelationship)?.name}
            </span>
            ?
          </p>
        }
        confirmText="Remove"
        type="danger"
      />
    </div>
  );
};

export default ExerciseRelationships;
