// src/pages/exercises/tabs/ExerciseMuscles.tsx
import { useState, useEffect } from 'react';
import { Plus, Trash2, Target } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import ConfirmationDialog from '../../../components/ui/confirmation-dialog';
import Modal from '../../../components/ui/modal';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import EmptyState from '../../../components/ui/empty-state';
import muscleService, {
  Muscle,
  MuscleGroup,
  MuscleTarget,
} from '../../../api/muscleService';
import exerciseMuscleService from '../../../api/exerciseMuscleService';

interface ExerciseMusclesProps {
  exerciseId: string;
}

const ExerciseMuscles = ({ exerciseId }: ExerciseMusclesProps) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [muscleTargets, setMuscleTargets] = useState<MuscleTarget[]>([]);
  const [muscles, setMuscles] = useState<Muscle[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<MuscleTarget | null>(
    null
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Form state
  const [selectedMuscleId, setSelectedMuscleId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<
    'PRIMARY' | 'SECONDARY' | 'TERTIARY'
  >('PRIMARY');
  const [activationPercentage, setActivationPercentage] = useState<number>(80);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [filteredMuscles, setFilteredMuscles] = useState<Muscle[]>([]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all required data
        const [targetData, musclesData, groupsData] = await Promise.all([
          exerciseMuscleService.getMuscleTargets(exerciseId),
          muscleService.getMuscles(),
          muscleService.getMuscleGroups(),
        ]);

        setMuscleTargets(targetData);
        setMuscles(musclesData);
        setFilteredMuscles(musclesData);
        setMuscleGroups(groupsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load muscle data',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [exerciseId]);

  // Filter muscles by selected group
  useEffect(() => {
    if (selectedGroupId) {
      setFilteredMuscles(
        muscles.filter((m) => m.muscleGroupId === selectedGroupId)
      );
    } else {
      setFilteredMuscles(muscles);
    }
  }, [selectedGroupId, muscles]);

  // Handle muscle target creation
  const handleAddMuscleTarget = async () => {
    if (!selectedMuscleId) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please select a muscle',
      });
      return;
    }

    // Check if muscle is already targeted
    if (muscleTargets.some((target) => target.muscleId === selectedMuscleId)) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'This muscle is already targeted',
      });
      return;
    }

    try {
      const newTarget = await exerciseMuscleService.createMuscleTarget({
        exerciseId,
        muscleId: selectedMuscleId,
        role: selectedRole,
        activationPercentage,
      });

      // Get complete muscle info
      const targetedMuscle = muscles.find((m) => m.id === selectedMuscleId);
      if (targetedMuscle) {
        const completeTarget = {
          ...newTarget,
          muscle: targetedMuscle,
        };

        setMuscleTargets([...muscleTargets, completeTarget]);
      }

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Muscle target added successfully',
      });

      // Reset form and close modal
      setSelectedMuscleId('');
      setSelectedRole('PRIMARY');
      setActivationPercentage(80);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding muscle target:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to add muscle target',
      });
    }
  };

  // Handle muscle target deletion
  const handleDeleteMuscleTarget = async () => {
    if (!selectedTarget) return;

    try {
      await exerciseMuscleService.deleteMuscleTarget(selectedTarget.id);

      setMuscleTargets(
        muscleTargets.filter((target) => target.id !== selectedTarget.id)
      );

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Muscle target removed successfully',
      });

      setSelectedTarget(null);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting muscle target:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to remove muscle target',
      });
    }
  };

  const confirmDelete = (target: MuscleTarget) => {
    setSelectedTarget(target);
    setShowDeleteDialog(true);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'PRIMARY':
        return 'bg-blue-100 text-blue-800';
      case 'SECONDARY':
        return 'bg-purple-100 text-purple-800';
      case 'TERTIARY':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Group targets by role for display
  const primaryTargets = muscleTargets.filter((t) => t.role === 'PRIMARY');
  const secondaryTargets = muscleTargets.filter((t) => t.role === 'SECONDARY');
  const tertiaryTargets = muscleTargets.filter((t) => t.role === 'TERTIARY');

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
        <h3 className="text-lg font-medium text-gray-900">Muscle Targets</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Muscle Target
        </button>
      </div>

      {/* Muscle targets display */}
      {muscleTargets.length > 0 ? (
        <div className="space-y-6">
          {/* Primary muscles */}
          {primaryTargets.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                Primary Muscles
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {primaryTargets.map((target) => (
                  <div
                    key={target.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 relative hover:shadow-md transition-shadow"
                  >
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => confirmDelete(target)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <h5 className="font-medium text-gray-900">
                      {target.muscle?.name}
                    </h5>
                    <p className="text-sm text-gray-500">
                      {target.muscle?.commonName}
                    </p>
                    <div className="mt-2 flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${target.activationPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {target.activationPercentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Secondary muscles */}
          {secondaryTargets.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                Secondary Muscles
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {secondaryTargets.map((target) => (
                  <div
                    key={target.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 relative hover:shadow-md transition-shadow"
                  >
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => confirmDelete(target)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <h5 className="font-medium text-gray-900">
                      {target.muscle?.name}
                    </h5>
                    <p className="text-sm text-gray-500">
                      {target.muscle?.commonName}
                    </p>
                    <div className="mt-2 flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${target.activationPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {target.activationPercentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tertiary muscles */}
          {tertiaryTargets.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                <span className="w-3 h-3 rounded-full bg-gray-500 mr-2"></span>
                Tertiary Muscles
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {tertiaryTargets.map((target) => (
                  <div
                    key={target.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 relative hover:shadow-md transition-shadow"
                  >
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => confirmDelete(target)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <h5 className="font-medium text-gray-900">
                      {target.muscle?.name}
                    </h5>
                    <p className="text-sm text-gray-500">
                      {target.muscle?.commonName}
                    </p>
                    <div className="mt-2 flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gray-500 h-2 rounded-full"
                          style={{ width: `${target.activationPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {target.activationPercentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={<Target className="h-12 w-12 text-gray-400" />}
          title="No muscle targets defined"
          description="Add muscle targets to specify which muscles are worked during this exercise."
          action={
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Muscle Target
            </button>
          }
        />
      )}

      {/* Add muscle target modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Muscle Target"
        size="md"
        footer={
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddMuscleTarget}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Add Target
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Muscle group filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Muscle Group
            </label>
            <Select
              options={[
                { value: '', label: 'All Muscle Groups' },
                ...muscleGroups.map((group) => ({
                  value: group.id,
                  label: group.name,
                })),
              ]}
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
            />
          </div>

          {/* Muscle selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Muscle
            </label>
            <Select
              options={[
                { value: '', label: 'Select a muscle' },
                ...filteredMuscles.map((muscle) => ({
                  value: muscle.id,
                  label: `${muscle.name} (${muscle.commonName || ''})`,
                })),
              ]}
              value={selectedMuscleId}
              onChange={(e) => setSelectedMuscleId(e.target.value)}
            />
          </div>

          {/* Role selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <Select
              options={[
                { value: 'PRIMARY', label: 'Primary - Main muscle worked' },
                { value: 'SECONDARY', label: 'Secondary - Supporting muscle' },
                { value: 'TERTIARY', label: 'Tertiary - Indirectly worked' },
              ]}
              value={selectedRole}
              onChange={(e) =>
                setSelectedRole(
                  e.target.value as 'PRIMARY' | 'SECONDARY' | 'TERTIARY'
                )
              }
            />
          </div>

          {/* Activation percentage */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Activation Percentage
              </label>
              <span className="text-sm text-gray-500">
                {activationPercentage}%
              </span>
            </div>
            <Input
              type="range"
              min="1"
              max="100"
              value={activationPercentage}
              onChange={(e) =>
                setActivationPercentage(parseInt(e.target.value))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </Modal>

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedTarget(null);
        }}
        onConfirm={handleDeleteMuscleTarget}
        title="Remove Muscle Target"
        message={
          <p>
            Are you sure you want to remove{' '}
            <span className="font-medium">{selectedTarget?.muscle?.name}</span>{' '}
            from this exercise?
          </p>
        }
        confirmText="Remove"
        type="danger"
      />
    </div>
  );
};

export default ExerciseMuscles;
