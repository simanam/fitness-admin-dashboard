// src/pages/exercises/tabs/ExerciseRelationships.tsx
import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Link as LinkIcon,
  Edit,
} from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import ConfirmationDialog from '../../../components/ui/confirmation-dialog';
import Modal from '../../../components/ui/modal';
import { Select } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { Checkbox } from '../../../components/ui/checkbox';
import EmptyState from '../../../components/ui/empty-state';
import exerciseService from '../../../api/exerciseService';
import type { Exercise } from '../../../api/exerciseService';
import relationshipService from '../../../api/relationshipService';
import type {
  ExerciseRelationship,
  ProgressionPath,
  ProgressionRelationship,
} from '../../../api/relationshipService';
import DifficultyIndicator from '../../../components/exercises/DifficultyIndicator';
import RelationshipEditModal from '../../../components/exercises/RelationshipEditModal';
import ProgressionPathVisualization from '../../../components/exercises/ProgressionPathVisualization';

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRelationship, setSelectedRelationship] =
    useState<ExerciseRelationship | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVisualization, setShowVisualization] = useState(true);

  // Form state
  const [relatedExerciseId, setRelatedExerciseId] = useState<string>('');
  const [relationshipType, setRelationshipType] = useState<
    'progression' | 'variation' | 'alternative'
  >('variation');
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

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch relationships, progression path, and exercises for selection
      const [relationshipsData, progressionData, exercisesData] =
        await Promise.all([
          relationshipService.getExerciseRelationships(exerciseId),
          relationshipService.getProgressionPath(exerciseId),
          exerciseService.getExercises({
            status: 'published',
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
  }, [exerciseId, showToast]);

  // Fetch data
  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Reset form state
  const resetForm = () => {
    setRelatedExerciseId('');
    setRelationshipType('variation');
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

    setIsSubmitting(true);
    try {
      await relationshipService.createRelationship({
        baseExerciseId: exerciseId,
        relatedExerciseId: relatedExerciseId,
        relationshipType: relationshipType,
        difficultyChange:
          relationshipType === 'progression' ? difficultyChange : 0,
        bidirectional: bidirectional,
        modificationDetails:
          relationshipType !== 'progression' ? modificationDetails : undefined,
      });

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Relationship added successfully',
      });

      // Refresh data
      fetchData();
      resetForm();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding relationship:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to add relationship',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle relationship update
  const handleUpdateRelationship = async (data: {
    relationshipType: 'progression' | 'variation' | 'alternative';
    difficultyChange: number;
    bidirectional: boolean;
    modificationDetails?: {
      setupChanges: string;
      techniqueChanges: string;
      targetMuscleImpact: string;
    };
  }) => {
    if (!selectedRelationship) return;

    setIsSubmitting(true);
    try {
      await relationshipService.updateRelationship(
        selectedRelationship.id,
        data
      );

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Relationship updated successfully',
      });

      // Refresh data
      fetchData();
      setShowEditModal(false);
      setSelectedRelationship(null);
    } catch (error) {
      console.error('Error updating relationship:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update relationship',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle relationship deletion
  const handleDeleteRelationship = async () => {
    if (!selectedRelationship) return;

    setIsSubmitting(true);
    try {
      await relationshipService.deleteRelationship(selectedRelationship.id);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Relationship removed successfully',
      });

      // Refresh data
      fetchData();
      setShowDeleteDialog(false);
      setSelectedRelationship(null);
    } catch (error) {
      console.error('Error deleting relationship:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to remove relationship',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm delete
  const confirmDelete = (relationship: ExerciseRelationship) => {
    setSelectedRelationship(relationship);
    setShowDeleteDialog(true);
  };

  // Open edit modal
  const openEditModal = (relationship: ExerciseRelationship) => {
    setSelectedRelationship(relationship);
    setShowEditModal(true);
  };

  // Group relationships by type for display
  const progressionRelationships = relationships.filter(
    (r) => r.relationshipType === 'progression'
  );
  const variationRelationships = relationships.filter(
    (r) => r.relationshipType === 'variation'
  );
  const alternativeRelationships = relationships.filter(
    (r) => r.relationshipType === 'alternative'
  );

  // Get the related exercise object for display
  const getRelatedExercise = (relationship: ExerciseRelationship) => {
    if (relationship.baseExerciseId === exerciseId) {
      return relationship.relatedExercise;
    }
    return relationship.baseExercise;
  };

  // Get relationship direction indicator
  const getDirectionIndicator = (relationship: ExerciseRelationship) => {
    if (
      relationship.bidirectional ||
      relationship.relationshipType === 'variation'
    ) {
      return '↔️';
    }
    if (relationship.baseExerciseId === exerciseId) {
      return '→';
    }
    return '←';
  };

  // Handler for deleting a progression relationship from the visualization
  const handleDeleteFromVisualization = (
    relationship: ProgressionRelationship
  ) => {
    confirmDelete(relationship);
  };

  // Handler for editing a progression relationship from the visualization
  const handleEditFromVisualization = (
    relationship: ProgressionRelationship
  ) => {
    openEditModal(relationship);
  };

  // Toggle between visualization and list view
  const toggleView = () => {
    setShowVisualization(!showVisualization);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with title and add button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Relationships</h3>
        <div className="flex space-x-2">
          {progressionPath &&
            (progressionPath.easier.length > 0 ||
              progressionPath.harder.length > 0) && (
              <button
                type="button"
                onClick={toggleView}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                {showVisualization ? 'Show List View' : 'Show Visual View'}
              </button>
            )}

          <button
            type="button"
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
      </div>

      {/* Display progression path if available */}
      {progressionPath &&
        (progressionPath.easier.length > 0 ||
          progressionPath.harder.length > 0) &&
        showVisualization && (
          <ProgressionPathVisualization
            progressionPath={progressionPath}
            currentExercise={exercise}
            onDeleteRelationship={handleDeleteFromVisualization}
            onEditRelationship={handleEditFromVisualization}
          />
        )}

      {/* Display list view when visualization is off or there's no progression data */}
      {(!showVisualization ||
        !(
          progressionPath &&
          (progressionPath.easier.length > 0 ||
            progressionPath.harder.length > 0)
        )) && (
        <>
          {/* Progression Section in List View */}
          {progressionRelationships.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-6">
              <h4 className="font-medium text-gray-900 mb-4">
                Progression Path
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {progressionRelationships.map((relationship) => {
                  const relatedExercise = getRelatedExercise(relationship);
                  const isHarder =
                    (relationship.baseExerciseId === exerciseId &&
                      relationship.difficultyChange > 0) ||
                    (relationship.relatedExerciseId === exerciseId &&
                      relationship.difficultyChange < 0);

                  return (
                    <div
                      key={relationship.id}
                      className="flex items-center justify-between border border-gray-200 rounded-lg p-3 bg-white"
                    >
                      <div>
                        <div className="font-medium flex items-center">
                          {isHarder ? (
                            <ChevronUp
                              size={16}
                              className="mr-1 text-red-500"
                            />
                          ) : (
                            <ChevronDown
                              size={16}
                              className="mr-1 text-blue-500"
                            />
                          )}
                          {relatedExercise?.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {relationship.difficultyChange !== 0 && (
                            <DifficultyIndicator
                              value={relationship.difficultyChange}
                              size="sm"
                            />
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(relationship)}
                          className="text-gray-400 hover:text-blue-500"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          type="button"
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

          {/* Relationships list by type - Variations */}
          {variationRelationships.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                <span className="w-3 h-3 rounded-full bg-purple-500 mr-2" />
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

                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(relationship)}
                            className="text-gray-400 hover:text-blue-500"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmDelete(relationship)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
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
                <span className="w-3 h-3 rounded-full bg-green-500 mr-2" />
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

                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(relationship)}
                            className="text-gray-400 hover:text-blue-500"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmDelete(relationship)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {relationships.length === 0 && (
        <EmptyState
          icon={<LinkIcon className="h-12 w-12 text-gray-400" />}
          title="No relationships defined"
          description="Create relationships between this exercise and other exercises to build progression paths, variations, and alternatives."
          action={
            <button
              type="button"
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
              type="button"
              onClick={() => {
                resetForm();
                setShowAddModal(false);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddRelationship}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              disabled={isSubmitting || !relatedExerciseId}
            >
              {isSubmitting ? 'Adding...' : 'Add Relationship'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Exercise selection */}
          <div>
            <label
              htmlFor="related-exercise"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Related Exercise
            </label>
            <Select
              id="related-exercise"
              value={relatedExerciseId}
              onChange={(e) => setRelatedExerciseId(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="">Select an exercise</option>
              {exercises.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.difficulty})
                </option>
              ))}
            </Select>
            {exercises.length === 0 && (
              <p className="mt-1 text-sm text-yellow-600">
                All published exercises are already related to this exercise.
              </p>
            )}
          </div>

          {/* Relationship type */}
          <div>
            <label
              htmlFor="relationship-type"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Relationship Type
            </label>
            <Select
              id="relationship-type"
              value={relationshipType}
              onChange={(e) =>
                setRelationshipType(
                  e.target.value as 'progression' | 'variation' | 'alternative'
                )
              }
              disabled={isSubmitting}
            >
              <option value="progression">
                Progression - Part of a difficulty progression
              </option>
              <option value="variation">
                Variation - Similar movement pattern
              </option>
              <option value="alternative">
                Alternative - Substitute exercise
              </option>
            </Select>
          </div>

          {/* Conditional fields based on relationship type */}
          {relationshipType === 'progression' && (
            <div>
              <label
                htmlFor="difficulty-change"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Difficulty Change
              </label>
              <div className="flex items-center space-x-2">
                <button
                  id="difficulty-change"
                  type="button"
                  onClick={() =>
                    setDifficultyChange(Math.max(-3, difficultyChange - 1))
                  }
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
          {relationshipType !== 'progression' && (
            <div>
              <Checkbox
                id="bidirectional"
                checked={bidirectional}
                onChange={(e) => setBidirectional(e.target.checked)}
                label="Bidirectional relationship"
                helperText="If checked, the relationship works both ways"
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Modification details for non-progression relationships */}
          {relationshipType !== 'progression' && (
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-700">
                Modification Details
              </h5>

              <div>
                <label
                  htmlFor="setup-changes"
                  className="block text-xs text-gray-500 mb-1"
                >
                  Setup Changes
                </label>
                <Textarea
                  id="setup-changes"
                  value={modificationDetails.setupChanges}
                  onChange={(e) =>
                    setModificationDetails({
                      ...modificationDetails,
                      setupChanges: e.target.value,
                    })
                  }
                  placeholder="How does the setup differ between these exercises?"
                  rows={2}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label
                  htmlFor="technique-changes"
                  className="block text-xs text-gray-500 mb-1"
                >
                  Technique Changes
                </label>
                <Textarea
                  id="technique-changes"
                  value={modificationDetails.techniqueChanges}
                  onChange={(e) =>
                    setModificationDetails({
                      ...modificationDetails,
                      techniqueChanges: e.target.value,
                    })
                  }
                  placeholder="How does the execution technique differ?"
                  rows={2}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label
                  htmlFor="muscle-impact"
                  className="block text-xs text-gray-500 mb-1"
                >
                  Target Muscle Impact
                </label>
                <Textarea
                  id="muscle-impact"
                  value={modificationDetails.targetMuscleImpact}
                  onChange={(e) =>
                    setModificationDetails({
                      ...modificationDetails,
                      targetMuscleImpact: e.target.value,
                    })
                  }
                  placeholder="How does this change affect the muscles targeted?"
                  rows={2}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Edit modal using the RelationshipEditModal component */}
      <RelationshipEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRelationship(null);
        }}
        relationship={selectedRelationship}
        onUpdate={handleUpdateRelationship}
        isSubmitting={isSubmitting}
      />

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
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ExerciseRelationships;
