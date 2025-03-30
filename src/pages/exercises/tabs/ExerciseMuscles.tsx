// src/pages/exercises/tabs/ExerciseMuscles.tsx
import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import exerciseMuscleService, {
  CreateMuscleTargetPayload,
} from '../../../api/exerciseMuscleService';
import muscleService, {
  Muscle,
  MuscleTarget,
} from '../../../api/muscleService';
import ConfirmationDialog from '../../../components/ui/confirmation-dialog';
import EmptyState from '../../../components/ui/empty-state';
import MuscleTargetForm from '../../../components/exercises/MuscleTargetForm';
import BulkMuscleTargetForm from '../../../components/exercises/BulkMuscleTargetForm';
import MuscleTargetList from '../../../components/exercises/MuscleTargetList';
import MuscleTargetingVisualization from '../../../components/exercises/MuscleTargetingVisualization';
import Modal from '../../../components/ui/modal';

interface ExerciseMusclesProps {
  exerciseId: string;
}

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

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [exerciseId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [targetsData, musclesData] = await Promise.all([
        exerciseMuscleService.getMuscleTargets(exerciseId),
        muscleService.getMuscles(),
      ]);

      console.log(targetsData, 'tage dat', musclesData, 'memem');

      setMuscleTargets(targetsData);
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
  };

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

    allMuscles.forEach((muscle) => {
      if (muscle.muscleGroup && !groupMap.has(muscle.muscleGroup.id)) {
        groupMap.set(muscle.muscleGroup.id, muscle.muscleGroup);
      }
    });

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
            targets={muscleTargets}
            onSelectTarget={handleEditTarget}
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
            targets={primaryTargets}
            onEdit={handleEditTarget}
            onDelete={handleDeleteConfirm}
            role="primary"
          />

          {/* Secondary targets */}
          <MuscleTargetList
            title="Secondary Muscles"
            description="These muscles assist in the movement but aren't the main focus"
            targets={secondaryTargets}
            onEdit={handleEditTarget}
            onDelete={handleDeleteConfirm}
            role="secondary"
          />

          {/* Synergist targets */}
          <MuscleTargetList
            title="Synergist Muscles"
            description="These muscles help coordinate the movement"
            targets={synergistTargets}
            onEdit={handleEditTarget}
            onDelete={handleDeleteConfirm}
            role="synergist"
          />

          {/* Stabilizer targets */}
          <MuscleTargetList
            title="Stabilizer Muscles"
            description="These muscles help maintain posture and stability during the exercise"
            targets={stabilizerTargets}
            onEdit={handleEditTarget}
            onDelete={handleDeleteConfirm}
            role="stabilizer"
          />
        </div>
      ) : (
        <EmptyState
          icon={<AlertTriangle className="h-12 w-12 text-gray-400" />}
          title="No muscles targeted"
          description="Add muscles that are targeted by this exercise."
          action={
            <button
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
