// src/pages/exercises/tabs/ExerciseMuscles.tsx
import { useState, useEffect, useCallback } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import exerciseMuscleService from '../../../api/exerciseMuscleService';
import type { CreateMuscleTargetPayload } from '../../../api/exerciseMuscleService';
import muscleService from '../../../api/muscleService';
import type { Muscle } from '../../../api/muscleService';
import { MuscleTargetList } from '../../../components/exercises/MuscleTargetList';

// Define MuscleTarget type here since it's missing from types/muscle
type MuscleRole = 'primary' | 'secondary' | 'synergist' | 'stabilizer';
type MuscleType = 'PRIMARY' | 'SECONDARY' | 'TERTIARY';

// Base interface for component muscle targets
interface BaseMuscleTarget {
  id: string;
  muscle?: Muscle;
  role: 'primary' | 'secondary' | 'synergist' | 'stabilizer';
  activationPercentage: number;
}

// Base interface for API responses
interface ApiMuscleTarget {
  id: string;
  exerciseId: string;
  muscleId: string;
  type: MuscleType;
  role: string;
  activationPercentage: number;
  notes?: string;
  muscle?: Muscle;
}

// Combine both interfaces for our component
interface MuscleTarget {
  id: string;
  name: string;
  progress: number;
  muscle?: Muscle;
  role: MuscleRole;
  activationPercentage: number;
  exerciseId: string;
  muscleId: string;
  type: MuscleType;
  notes?: string;
}

// interface MuscleTargetListProps {
//   title: string;
//   description: string;
//   targets: MuscleTarget[];
//   onEdit: (target: MuscleTarget) => void;
//   onDelete: (target: MuscleTarget) => void;
//   targetType: 'primary' | 'secondary' | 'synergist' | 'stabilizer';
// }

import ConfirmationDialog from '../../../components/ui/confirmation-dialog';
import EmptyState from '../../../components/ui/empty-state';
import MuscleTargetForm from '../../../components/exercises/MuscleTargetForm';
import BulkMuscleTargetForm from '../../../components/exercises/BulkMuscleTargetForm';
import MuscleTargetingVisualization from '../../../components/exercises/MuscleTargetingVisualization';
import Modal from '../../../components/ui/modal';

interface ExerciseMusclesProps {
  exerciseId: string;
}

// Props for MuscleTargetList component

// Props for MuscleTargetingVisualization component

const ExerciseMuscles = ({ exerciseId }: ExerciseMusclesProps) => {
  const { showToast } = useToast();
  const [muscleTargets, setMuscleTargets] = useState<MuscleTarget[]>([]);
  const [allMuscles, setAllMuscles] = useState<Muscle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<MuscleTarget | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [targetsData, musclesData] = await Promise.all([
        exerciseMuscleService.getMuscleTargets(exerciseId),
        muscleService.getMuscles(),
      ]);

      // Transform the API response to match our MuscleTarget type
      const transformedTargets: MuscleTarget[] = (
        targetsData as unknown as ApiMuscleTarget[]
      ).map((target: ApiMuscleTarget) => ({
        id: target.id,
        exerciseId: target.exerciseId,
        muscleId: target.muscleId,
        type: target.type || 'PRIMARY',
        muscle: musclesData.find((m) => m.id === target.muscleId),
        role: target.role.toLowerCase() as MuscleRole,
        activationPercentage: target.activationPercentage || 50,
        notes: target.notes,
        name: musclesData.find((m) => m.id === target.muscleId)?.name || '',
        progress: target.activationPercentage || 50,
      }));

      setMuscleTargets(transformedTargets);
      setAllMuscles(musclesData);
    } catch (error) {
      console.error('Error fetching muscle data:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load muscle data',
      });
    } finally {
      setIsLoading(false);
    }
  }, [exerciseId, showToast]);

  // Fetch data
  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Add new muscle target
  const handleAddTarget = async (
    data: Omit<CreateMuscleTargetPayload, 'exerciseId'>
  ) => {
    setIsSubmitting(true);
    try {
      const payload: CreateMuscleTargetPayload = {
        exerciseId,
        ...data,
      };

      await exerciseMuscleService.createMuscleTarget(payload);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Muscle target added successfully',
      });

      // Refresh data
      await fetchData();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding muscle target:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to add muscle target',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add multiple muscle targets at once
  const handleBulkAddTargets = async (
    targets: Omit<CreateMuscleTargetPayload, 'exerciseId'>[]
  ) => {
    setIsSubmitting(true);
    try {
      await exerciseMuscleService.bulkCreateMuscleTargets(exerciseId, targets);

      showToast({
        type: 'success',
        title: 'Success',
        message: `${targets.length} muscle targets added successfully`,
      });

      // Refresh data
      await fetchData();
      setShowBulkAddModal(false);
    } catch (error) {
      console.error('Error adding bulk muscle targets:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to add muscle targets',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update existing muscle target
  const handleUpdateTarget = async (
    data: Omit<CreateMuscleTargetPayload, 'exerciseId' | 'muscleId'>
  ) => {
    if (!selectedTarget) return;

    setIsSubmitting(true);
    try {
      await exerciseMuscleService.updateMuscleTarget(selectedTarget.id, data);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Muscle target updated successfully',
      });

      // Refresh data
      await fetchData();
      setShowEditModal(false);
      setSelectedTarget(null);
    } catch (error) {
      console.error('Error updating muscle target:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update muscle target',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete muscle target
  const handleDeleteTarget = async () => {
    if (!selectedTarget) return;

    setIsSubmitting(true);
    try {
      await exerciseMuscleService.deleteMuscleTarget(selectedTarget.id);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Muscle target removed successfully',
      });

      // Refresh data
      await fetchData();
      setShowDeleteDialog(false);
      setSelectedTarget(null);
    } catch (error) {
      console.error('Error deleting muscle target:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to remove muscle target',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit modal
  const handleEditTarget = (target: MuscleTarget) => {
    setSelectedTarget(target);
    setShowEditModal(true);
  };

  // Open delete confirmation
  const handleDeleteConfirm = (target: MuscleTarget) => {
    setSelectedTarget(target);
    setShowDeleteDialog(true);
  };

  // Prepare muscles for selection (filter out already targeted muscles for new targets)
  const getAvailableMuscles = () => {
    if (selectedTarget) {
      // For editing, include the current muscle plus all unused ones
      return allMuscles.filter(
        (muscle) =>
          muscle.id === selectedTarget.muscleId ||
          !muscleTargets.some((target) => target.muscleId === muscle.id)
      );
    }

    // For adding new, only show unused muscles
    return allMuscles.filter(
      (muscle) => !muscleTargets.some((target) => target.muscleId === muscle.id)
    );
  };

  // Get all muscle groups for organization
  const getMuscleGroups = () => {
    const groupMap = new Map();

    for (const muscle of allMuscles) {
      if (muscle.muscleGroup && !groupMap.has(muscle.muscleGroup.id)) {
        groupMap.set(muscle.muscleGroup.id, muscle.muscleGroup);
      }
    }

    return Array.from(groupMap.values());
  };

  // Group targets by role for display
  const primaryTargets = muscleTargets.filter(
    (target) => target.role === 'primary'
  );
  const secondaryTargets = muscleTargets.filter(
    (target) => target.role === 'secondary'
  );
  const synergistTargets = muscleTargets.filter(
    (target) => target.role === 'synergist'
  );
  const stabilizerTargets = muscleTargets.filter(
    (target) => target.role === 'stabilizer'
  );
  // State for muscle visualization
  const [visualizationOpen, setVisualizationOpen] = useState(true);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  const availableMuscles = getAvailableMuscles();

  return (
    <div className="space-y-6">
      {/* Header with title and add buttons */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Target Muscles</h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setShowBulkAddModal(true)}
            disabled={availableMuscles.length === 0}
            className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md ${
              availableMuscles.length === 0
                ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-500'
                : 'text-gray-700 bg-white hover:bg-gray-50'
            } focus:outline-none`}
          >
            <Plus className="h-4 w-4 mr-1" />
            Bulk Add
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            disabled={availableMuscles.length === 0}
            className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md ${
              availableMuscles.length === 0
                ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-500'
                : 'text-gray-700 bg-white hover:bg-gray-50'
            } focus:outline-none`}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Single
          </button>
        </div>
      </div>

      {/* Muscle visualization toggle */}
      {muscleTargets.length > 0 && (
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={() => setVisualizationOpen(!visualizationOpen)}
            className="text-sm text-gray-600 underline flex items-center"
          >
            {visualizationOpen ? 'Hide Visualization' : 'Show Visualization'}
          </button>
        </div>
      )}

      {/* Muscle targeting visualization */}
      {muscleTargets.length > 0 && visualizationOpen && (
        <div className="mb-6">
          <MuscleTargetingVisualization
            targets={muscleTargets as BaseMuscleTarget[]}
            onSelectTarget={
              handleEditTarget as (target: BaseMuscleTarget) => void
            }
            selectedTargetId={selectedTarget?.id}
          />
        </div>
      )}

      {/* Muscle targets list */}
      {muscleTargets.length > 0 ? (
        <div className="space-y-6">
          <MuscleTargetList
            title="Primary Muscles"
            description="These muscles are the main focus of the exercise"
            targets={primaryTargets.map((target) => ({
              id: target.id,
              name: target.muscle?.name || '',
              progress: target.activationPercentage,
            }))}
            onEdit={(target) => {
              const fullTarget = muscleTargets.find((t) => t.id === target.id);
              if (fullTarget) handleEditTarget(fullTarget);
            }}
            onDelete={(target) => {
              const fullTarget = muscleTargets.find((t) => t.id === target.id);
              if (fullTarget) handleDeleteConfirm(fullTarget);
            }}
            muscleType="primary"
          />

          <MuscleTargetList
            title="Secondary Muscles"
            description="These muscles assist in the movement but aren't the main focus"
            targets={secondaryTargets.map((target) => ({
              id: target.id,
              name: target.muscle?.name || '',
              progress: target.activationPercentage,
            }))}
            onEdit={(target) => {
              const fullTarget = muscleTargets.find((t) => t.id === target.id);
              if (fullTarget) handleEditTarget(fullTarget);
            }}
            onDelete={(target) => {
              const fullTarget = muscleTargets.find((t) => t.id === target.id);
              if (fullTarget) handleDeleteConfirm(fullTarget);
            }}
            muscleType="secondary"
          />

          <MuscleTargetList
            title="Synergist Muscles"
            description="These muscles help coordinate the movement"
            targets={synergistTargets.map((target) => ({
              id: target.id,
              name: target.muscle?.name || '',
              progress: target.activationPercentage,
            }))}
            onEdit={(target) => {
              const fullTarget = muscleTargets.find((t) => t.id === target.id);
              if (fullTarget) handleEditTarget(fullTarget);
            }}
            onDelete={(target) => {
              const fullTarget = muscleTargets.find((t) => t.id === target.id);
              if (fullTarget) handleDeleteConfirm(fullTarget);
            }}
            muscleType="synergist"
          />

          <MuscleTargetList
            title="Stabilizer Muscles"
            description="These muscles help maintain posture and stability during the exercise"
            targets={stabilizerTargets.map((target) => ({
              id: target.id,
              name: target.muscle?.name || '',
              progress: target.activationPercentage,
            }))}
            onEdit={(target) => {
              const fullTarget = muscleTargets.find((t) => t.id === target.id);
              if (fullTarget) handleEditTarget(fullTarget);
            }}
            onDelete={(target) => {
              const fullTarget = muscleTargets.find((t) => t.id === target.id);
              if (fullTarget) handleDeleteConfirm(fullTarget);
            }}
            muscleType="stabilizer"
          />
        </div>
      ) : (
        <EmptyState
          icon={<AlertTriangle className="h-12 w-12 text-gray-400" />}
          title="No muscles targeted"
          description="Add muscles that are targeted by this exercise."
          action={
            <button
              type="button"
              onClick={() => setShowBulkAddModal(true)}
              disabled={availableMuscles.length === 0}
              className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md ${
                availableMuscles.length === 0
                  ? 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-700'
                  : 'text-white bg-black hover:bg-gray-800'
              } focus:outline-none`}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Muscle Targets
            </button>
          }
        />
      )}

      {/* Add single muscle target modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Muscle Target"
        size="md"
      >
        <MuscleTargetForm
          muscles={availableMuscles}
          onSubmit={handleAddTarget}
          onCancel={() => setShowAddModal(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Bulk add muscle targets modal */}
      <Modal
        isOpen={showBulkAddModal}
        onClose={() => setShowBulkAddModal(false)}
        title="Bulk Add Muscle Targets"
        size="lg"
      >
        <BulkMuscleTargetForm
          muscles={availableMuscles}
          muscleGroups={getMuscleGroups()}
          onSubmit={handleBulkAddTargets}
          onCancel={() => setShowBulkAddModal(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Edit muscle target modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTarget(null);
        }}
        title="Edit Muscle Target"
        size="md"
      >
        {selectedTarget && (
          <MuscleTargetForm
            muscles={availableMuscles}
            onSubmit={handleUpdateTarget}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedTarget(null);
            }}
            isSubmitting={isSubmitting}
            initialData={{
              muscleId: selectedTarget.muscleId,
              role: selectedTarget.role,
              activationPercentage: selectedTarget.activationPercentage,
            }}
            editMode={true}
          />
        )}
      </Modal>

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedTarget(null);
        }}
        onConfirm={handleDeleteTarget}
        title="Remove Muscle Target"
        message={
          <p>
            Are you sure you want to remove{' '}
            <span className="font-medium">
              {selectedTarget?.muscle?.name || 'this muscle'}
            </span>{' '}
            from the targeted muscles?
          </p>
        }
        confirmText="Remove"
        type="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ExerciseMuscles;
