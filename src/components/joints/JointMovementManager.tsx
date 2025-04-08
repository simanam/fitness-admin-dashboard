// src/components/joints/JointMovementManager.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Save, AlertTriangle, List, BarChart } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { Joint } from '../../api/jointService';
import jointService from '../../api/jointService';
import ConfirmationDialog from '../ui/confirmation-dialog';
import MovementList from './MovementList';
import MovementEditor from './MovementEditor';
import MovementVisualization from './MovementVisualization';
import { Motion } from './MovementTypes';

interface JointMovementManagerProps {
  joint: Joint;
  onUpdate?: (updatedJoint: Joint) => void;
  readOnly?: boolean;
}

const JointMovementManager: React.FC<JointMovementManagerProps> = ({
  joint,
  onUpdate,
  readOnly = false,
}) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddMovement, setShowAddMovement] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [movementToDelete, setMovementToDelete] = useState<Motion | null>(null);
  const [movementIndexToDelete, setMovementIndexToDelete] =
    useState<number>(-1);
  const [movementToEdit, setMovementToEdit] = useState<Motion | null>(null);
  const [movementIndexToEdit, setMovementIndexToEdit] = useState<number>(-1);
  const [showVisualization, setShowVisualization] = useState(true);

  // Convert joint movements to our internal format
  const [movements, setMovements] = useState<Motion[]>([]);

  // Convert joint data on initial load and when joint changes
  useEffect(() => {
    if (joint && joint.movements) {
      // Map joint movements to our internal Motion type
      const mappedMovements: Motion[] = joint.movements.primary.map(
        (movement) => ({
          name: movement.name,
          plane: movement.plane as any,
          range: { ...movement.range },
          description: '',
        })
      );

      setMovements(mappedMovements);
    }
  }, [joint]);

  // Handle saving all movements
  const handleSaveMovements = async () => {
    setIsLoading(true);
    try {
      // Convert our internal movements back to the format the API expects
      const apiMovements = {
        primary: movements.map((m) => ({
          name: m.name,
          plane: m.plane,
          range: m.range,
        })),
        accessory: joint.movements.accessory || [], // Preserve any existing accessory movements
      };

      const updatedJoint = await jointService.updateMovements(
        joint.id,
        apiMovements
      );

      if (onUpdate) {
        onUpdate(updatedJoint);
      }

      setIsEditing(false);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Joint movements updated successfully',
      });
    } catch (error) {
      console.error('Error updating joint movements:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update joint movements',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a new movement
  const handleAddMovement = (movement: Motion) => {
    setMovements([...movements, movement]);
    setShowAddMovement(false);

    // If we're not already in edit mode, enter it
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  // Handle editing a movement
  const handleEditMovement = (movement: Motion, index: number) => {
    setMovementToEdit(movement);
    setMovementIndexToEdit(index);
  };

  // Save edited movement
  const handleSaveEditedMovement = (editedMovement: Motion) => {
    const updatedMovements = [...movements];
    updatedMovements[movementIndexToEdit] = editedMovement;

    setMovements(updatedMovements);
    setMovementToEdit(null);
    setMovementIndexToEdit(-1);
  };

  // Handle deleting a movement
  const handleDeleteMovement = (movement: Motion, index: number) => {
    setMovementToDelete(movement);
    setMovementIndexToDelete(index);
    setShowDeleteDialog(true);
  };

  // Confirm deletion of a movement
  const confirmDeleteMovement = () => {
    if (movementToDelete === null || movementIndexToDelete === -1) return;

    const updatedMovements = [...movements];
    updatedMovements.splice(movementIndexToDelete, 1);

    setMovements(updatedMovements);
    setShowDeleteDialog(false);
    setMovementToDelete(null);
    setMovementIndexToDelete(-1);

    // If we're not already in edit mode, enter it
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    // Reset to original data
    if (joint && joint.movements) {
      const mappedMovements: Motion[] = joint.movements.primary.map(
        (movement) => ({
          name: movement.name,
          plane: movement.plane as any,
          range: { ...movement.range },
          description: '',
        })
      );

      setMovements(mappedMovements);
    }

    setIsEditing(false);
    setShowAddMovement(false);
    setMovementToEdit(null);
    setMovementIndexToEdit(-1);
  };

  // Toggle between visualization and list view
  const toggleView = () => {
    setShowVisualization(!showVisualization);
  };

  // Check if movements have been changed
  const hasChanges = () => {
    if (movements.length !== joint.movements.primary.length) {
      return true;
    }

    // Check each movement for changes
    for (let i = 0; i < movements.length; i++) {
      const currentMovement = movements[i];
      const originalMovement = joint.movements.primary[i];

      if (
        currentMovement.name !== originalMovement.name ||
        currentMovement.plane !== originalMovement.plane ||
        currentMovement.range.min !== originalMovement.range.min ||
        currentMovement.range.max !== originalMovement.range.max
      ) {
        return true;
      }
    }

    return false;
  };

  // Get names of movements already in use
  const getUsedMovementNames = () => {
    return movements.map((m) => m.name);
  };

  return (
    <div className="space-y-6">
      {/* Header with title and actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Joint Movements</h3>

        <div className="flex space-x-2">
          {/* View toggle - only show if there are movements */}
          {movements.length > 0 && (
            <button
              onClick={toggleView}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {showVisualization ? (
                <>
                  <List size={16} className="mr-1" />
                  Show List
                </>
              ) : (
                <>
                  <BarChart size={16} className="mr-1" />
                  Show Visualization
                </>
              )}
            </button>
          )}

          {/* Edit/Save/Cancel buttons */}
          {!readOnly &&
            (isEditing ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMovements}
                  className="inline-flex items-center px-3 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400"
                  disabled={isLoading || !hasChanges()}
                >
                  <Save size={16} className="mr-1" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Edit Movements
              </button>
            ))}
        </div>
      </div>

      {/* Empty state for no movements */}
      {movements.length === 0 && !showAddMovement && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-yellow-700">
              No movements defined for this joint.
            </p>
            {!readOnly && (
              <button
                onClick={() => setShowAddMovement(true)}
                className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                <Plus size={16} className="mr-1" />
                Add Movement
              </button>
            )}
          </div>
        </div>
      )}

      {/* Movement editor for adding new movement */}
      {showAddMovement && (
        <MovementEditor
          onSave={handleAddMovement}
          onCancel={() => setShowAddMovement(false)}
          usedMovementNames={getUsedMovementNames()}
        />
      )}

      {/* Movement editor for editing existing movement */}
      {movementToEdit && (
        <MovementEditor
          initialMovement={movementToEdit}
          onSave={handleSaveEditedMovement}
          onCancel={() => {
            setMovementToEdit(null);
            setMovementIndexToEdit(-1);
          }}
          usedMovementNames={getUsedMovementNames().filter(
            (name) => name !== movementToEdit.name
          )}
          isEditing={true}
        />
      )}

      {/* Movement visualization or list */}
      {movements.length > 0 &&
        (showVisualization ? (
          <MovementVisualization
            movements={movements}
            onSelectMovement={
              !readOnly && isEditing
                ? (movement) => {
                    const index = movements.findIndex(
                      (m) =>
                        m.name === movement.name && m.plane === movement.plane
                    );
                    if (index !== -1) {
                      handleEditMovement(movement, index);
                    }
                  }
                : undefined
            }
          />
        ) : (
          <MovementList
            movements={movements}
            onEdit={handleEditMovement}
            onDelete={handleDeleteMovement}
            isReadOnly={readOnly || !isEditing}
          />
        ))}

      {/* Add movement button */}
      {!readOnly && isEditing && !showAddMovement && !movementToEdit && (
        <button
          onClick={() => setShowAddMovement(true)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Plus size={16} className="mr-1" />
          Add Movement
        </button>
      )}

      {/* Reference information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
        <h4 className="font-medium text-gray-900 mb-2">
          Understanding Joint Movements
        </h4>
        <p className="text-sm text-gray-600 mb-3">
          Joint movements define the specific ways a joint can move, including:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>The name of the movement (e.g., flexion, extension, rotation)</li>
          <li>
            The plane in which the movement occurs (sagittal, frontal,
            transverse, or multi-planar)
          </li>
          <li>
            The range of motion in degrees, defining the normal limits of
            movement
          </li>
        </ul>
        <p className="text-sm text-gray-600 mt-2">
          This information is crucial for exercise developers to understand the
          safe and functional movement capabilities of each joint.
        </p>
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setMovementToDelete(null);
          setMovementIndexToDelete(-1);
        }}
        onConfirm={confirmDeleteMovement}
        title="Remove Movement"
        message={
          <p>
            Are you sure you want to remove the{' '}
            <span className="font-medium capitalize">
              {movementToDelete?.name.replace(/_/g, ' ')}
            </span>{' '}
            movement?
          </p>
        }
        confirmText="Remove"
        type="danger"
      />
    </div>
  );
};

export default JointMovementManager;
