// src/pages/exercises/tabs/ExerciseJoints.tsx
import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, AlertTriangle, Link } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import exerciseJointService, {
  JointInvolvement,
  CreateJointInvolvementPayload,
} from '../../../api/exerciseJointService';
import jointService, { Joint } from '../../../api/jointService';
import ConfirmationDialog from '../../../components/ui/confirmation-dialog';
import EmptyState from '../../../components/ui/empty-state';
import Modal from '../../../components/ui/modal';
import JointInvolvementForm from '../../../components/exercises/JointInvolvementForm';

interface ExerciseJointsProps {
  exerciseId: string;
}

const ExerciseJoints = ({ exerciseId }: ExerciseJointsProps) => {
  const { showToast } = useToast();
  // Initialize state based on the API response structure
  const [primaryInvolvements, setPrimaryInvolvements] = useState<
    JointInvolvement[]
  >([]);
  const [secondaryInvolvements, setSecondaryInvolvements] = useState<
    JointInvolvement[]
  >([]);
  const [allJoints, setAllJoints] = useState<Joint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedInvolvement, setSelectedInvolvement] =
    useState<JointInvolvement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [exerciseId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [involvementsResponse, jointsResponse] = await Promise.all([
        exerciseJointService.getJointInvolvements(exerciseId),
        jointService.getJoints(),
      ]);

      // Transform the API data to match component format
      const transformInvolvement = (item) => ({
        id: item.id,
        exerciseId: item.exerciseId,
        jointId: item.jointId,
        joint: item.joint,
        involvementType: item.isPrimary ? 'primary' : 'secondary',
        movementPattern: item.movementType,
        rangeOfMotion: {
          min: 0, // Assuming minimum is 0 if not provided
          max: item.romRequired,
        },
        notes: item.movementNotes,
      });

      // Handle the response based on its structure
      if (Array.isArray(involvementsResponse)) {
        const transformedInvolvements =
          involvementsResponse.map(transformInvolvement);
        setPrimaryInvolvements(
          transformedInvolvements.filter(
            (item) => item.involvementType === 'primary'
          )
        );
        setSecondaryInvolvements(
          transformedInvolvements.filter(
            (item) => item.involvementType === 'secondary'
          )
        );
      } else {
        // Handle the object structure with primary and all properties
        const allInvolvements = Array.isArray(involvementsResponse.all)
          ? involvementsResponse.all.map(transformInvolvement)
          : [];

        setPrimaryInvolvements(
          allInvolvements.filter((item) => item.involvementType === 'primary')
        );

        setSecondaryInvolvements(
          allInvolvements.filter((item) => item.involvementType === 'secondary')
        );
      }

      // Handle joints data
      const jointsData =
        jointsResponse.data?.items || jointsResponse.data || [];
      setAllJoints(Array.isArray(jointsData) ? jointsData : []);
    } catch (error) {
      console.error('Error fetching joint data:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load joint involvement data',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add new joint involvement
  const handleAddInvolvement = async (
    data: Omit<CreateJointInvolvementPayload, 'exerciseId'>
  ) => {
    setIsSubmitting(true);
    try {
      const formattedPayload = {
        exerciseId: exerciseId,
        jointId: data.jointId,
        movementType: data.movementPattern,
        romRequired: data.rangeOfMotion.max,
        isPrimary: data.involvementType === 'primary',
        movementNotes: data.notes || null,
      };

      await exerciseJointService.createJointInvolvement(formattedPayload);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Joint involvement added successfully',
      });

      await fetchData();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding joint involvement:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to add joint involvement',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update existing joint involvement
  const handleUpdateInvolvement = async (
    data: Omit<CreateJointInvolvementPayload, 'exerciseId' | 'jointId'>
  ) => {
    if (!selectedInvolvement) return;

    setIsSubmitting(true);
    try {
      const formattedPayload: Record<string, any> = {};

      if (data.movementPattern)
        formattedPayload.movementType = data.movementPattern;

      if (data.rangeOfMotion && typeof data.rangeOfMotion.max === 'number')
        formattedPayload.romRequired = data.rangeOfMotion.max;

      if (data.involvementType)
        formattedPayload.isPrimary = data.involvementType === 'primary';

      if (data.notes !== undefined) formattedPayload.movementNotes = data.notes;

      await exerciseJointService.updateJointInvolvement(
        selectedInvolvement.id,
        formattedPayload
      );

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Joint involvement updated successfully',
      });

      await fetchData();
      setShowEditModal(false);
      setSelectedInvolvement(null);
    } catch (error) {
      console.error('Error updating joint involvement:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update joint involvement',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete joint involvement
  const handleDeleteInvolvement = async () => {
    if (!selectedInvolvement) return;

    setIsSubmitting(true);
    try {
      await exerciseJointService.deleteJointInvolvement(selectedInvolvement.id);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Joint involvement removed successfully',
      });

      // Refresh data
      await fetchData();
      setShowDeleteDialog(false);
      setSelectedInvolvement(null);
    } catch (error) {
      console.error('Error deleting joint involvement:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to remove joint involvement',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit modal
  const handleEditInvolvement = (involvement: JointInvolvement) => {
    setSelectedInvolvement(involvement);
    setShowEditModal(true);
  };

  // Open delete confirmation
  const handleDeleteConfirm = (involvement: JointInvolvement) => {
    setSelectedInvolvement(involvement);
    setShowDeleteDialog(true);
  };

  // Prepare joints for selection (filter out already involved joints for new involvements)
  const getAvailableJoints = () => {
    // Get all joint IDs that are already used
    const usedJointIds = [...primaryInvolvements, ...secondaryInvolvements]
      .map((involvement) => involvement.jointId)
      .filter(Boolean); // Filter out any undefined values

    // Return joints that aren't already used
    return allJoints.filter((joint) => !usedJointIds.includes(joint.id));
  };

  // Check if there are any joint involvements
  const hasInvolvements =
    primaryInvolvements.length > 0 || secondaryInvolvements.length > 0;

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const availableJoints = getAvailableJoints();

  return (
    <div className="space-y-6">
      {/* Header with title and add button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Joint Involvement</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddModal(true)}
            disabled={availableJoints.length === 0}
            className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md ${
              availableJoints.length === 0
                ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-500'
                : 'text-gray-700 bg-white hover:bg-gray-50'
            } focus:outline-none`}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Joint
          </button>
        </div>
      </div>

      {/* Joint involvements list */}
      {hasInvolvements ? (
        <div className="space-y-6">
          {/* Primary joint involvements */}
          {primaryInvolvements.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-red-50 border-b border-red-100">
                <div className="flex items-center">
                  <div className="h-5 w-5 text-red-600 mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.25-7.25a.75.75 0 000-1.5H8.66l2.1-1.95a.75.75 0 10-1.02-1.1l-3.5 3.25a.75.75 0 000 1.1l3.5 3.25a.75.75 0 001.02-1.1l-2.1-1.95h4.59z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h4 className="font-medium text-red-800">Primary Joints</h4>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  These joints are primarily involved in the exercise movement
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {primaryInvolvements.map((involvement) => (
                  <div
                    key={involvement.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h5 className="font-medium text-gray-900">
                            {involvement.joint?.name || 'Joint'}
                          </h5>
                        </div>

                        <div className="mt-2 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Movement:</span>{' '}
                            {involvement.movementPattern}
                          </p>
                          <p>
                            <span className="font-medium">Range:</span>{' '}
                            {involvement.rangeOfMotion.min}° to{' '}
                            {involvement.rangeOfMotion.max}°
                          </p>
                          {involvement.notes && (
                            <p className="mt-1">
                              <span className="font-medium">Notes:</span>{' '}
                              {involvement.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditInvolvement(involvement)}
                          className="p-1 text-gray-400 hover:text-gray-700 rounded"
                          title="Edit involvement"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(involvement)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                          title="Remove involvement"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Secondary joint involvements */}
          {secondaryInvolvements.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
                <div className="flex items-center">
                  <div className="h-5 w-5 text-blue-600 mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.25-7.25a.75.75 0 000-1.5H8.66l2.1-1.95a.75.75 0 10-1.02-1.1l-3.5 3.25a.75.75 0 000 1.1l3.5 3.25a.75.75 0 001.02-1.1l-2.1-1.95h4.59z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h4 className="font-medium text-blue-800">
                    Secondary Joints
                  </h4>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  These joints play a supporting role in the exercise
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {secondaryInvolvements.map((involvement) => (
                  <div
                    key={involvement.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h5 className="font-medium text-gray-900">
                            {involvement.joint?.name || 'Joint'}
                          </h5>
                        </div>

                        <div className="mt-2 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Movement:</span>{' '}
                            {involvement.movementPattern}
                          </p>
                          <p>
                            <span className="font-medium">Range:</span>{' '}
                            {involvement.rangeOfMotion.min}° to{' '}
                            {involvement.rangeOfMotion.max}°
                          </p>
                          {involvement.notes && (
                            <p className="mt-1">
                              <span className="font-medium">Notes:</span>{' '}
                              {involvement.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditInvolvement(involvement)}
                          className="p-1 text-gray-400 hover:text-gray-700 rounded"
                          title="Edit involvement"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(involvement)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                          title="Remove involvement"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={<Link className="h-12 w-12 text-gray-400" />}
          title="No joint involvements defined"
          description="Add joint involvements to specify which joints are used in this exercise and how they move."
          action={
            <button
              onClick={() => setShowAddModal(true)}
              disabled={availableJoints.length === 0}
              className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md ${
                availableJoints.length === 0
                  ? 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-700'
                  : 'text-white bg-black hover:bg-gray-800'
              } focus:outline-none`}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Joint Involvement
            </button>
          }
        />
      )}

      {/* Add Joint Involvement Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Joint Involvement"
        size="md"
      >
        <JointInvolvementForm
          joints={availableJoints}
          onSubmit={handleAddInvolvement}
          onCancel={() => setShowAddModal(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Edit Joint Involvement Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedInvolvement(null);
        }}
        title="Edit Joint Involvement"
        size="md"
      >
        {selectedInvolvement && (
          <JointInvolvementForm
            joints={[
              ...(selectedInvolvement.joint ? [selectedInvolvement.joint] : []),
              ...availableJoints,
            ]}
            onSubmit={handleUpdateInvolvement}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedInvolvement(null);
            }}
            isSubmitting={isSubmitting}
            initialData={{
              jointId: selectedInvolvement.jointId,
              involvementType: selectedInvolvement.involvementType,
              movementPattern: selectedInvolvement.movementPattern,
              rangeOfMotion: selectedInvolvement.rangeOfMotion,
              notes: selectedInvolvement.notes,
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
          setSelectedInvolvement(null);
        }}
        onConfirm={handleDeleteInvolvement}
        title="Remove Joint Involvement"
        message={
          <p>
            Are you sure you want to remove{' '}
            <span className="font-medium">
              {selectedInvolvement?.joint?.name || 'this joint'}
            </span>{' '}
            from the involved joints?
          </p>
        }
        confirmText="Remove"
        type="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ExerciseJoints;
