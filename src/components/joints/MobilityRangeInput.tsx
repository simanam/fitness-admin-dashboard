// src/components/joints/MobilityRangeInput.tsx
import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import ConfirmationDialog from '../ui/confirmation-dialog';

interface MobilityRangeInputProps {
  mobilityRange: Record<string, any>;
  onChange: (mobilityRange: Record<string, any>) => void;
  error?: string;
}

const MobilityRangeInput: React.FC<MobilityRangeInputProps> = ({
  mobilityRange,
  onChange,
  error,
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newMovementType, setNewMovementType] = useState('');
  const [newMin, setNewMin] = useState(0);
  const [newMax, setNewMax] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [movementToDelete, setMovementToDelete] = useState('');

  // Common movement types that can have mobility ranges
  const availableMovementTypes = [
    'flexion',
    'extension',
    'abduction',
    'adduction',
    'rotation',
    'lateral_flexion',
    'circumduction',
    'protraction',
    'retraction',
    'elevation',
    'depression',
    'inversion',
    'eversion',
    'pronation',
    'supination',
  ].filter((type) => !Object.keys(mobilityRange).includes(type));

  // Handle adding a new mobility range
  const handleAddMobilityRange = () => {
    if (!newMovementType) {
      return; // Validation should prevent this
    }

    // Create a new updated mobility range object
    const updatedMobilityRange = {
      ...mobilityRange,
      [newMovementType]: {
        normal: {
          min: newMin,
          max: newMax,
          units: 'degrees',
        },
      },
    };

    // Update the parent component
    onChange(updatedMobilityRange);

    // Reset the form fields
    setNewMovementType('');
    setNewMin(0);
    setNewMax(0);
    setIsAddingNew(false);
  };

  // Handle updating an existing mobility range
  const handleUpdateMobilityRange = (
    movementType: string,
    field: 'min' | 'max',
    value: string
  ) => {
    const numValue = parseInt(value, 10) || 0;

    // Create an updated mobility range object
    const updatedMobilityRange = {
      ...mobilityRange,
      [movementType]: {
        ...mobilityRange[movementType],
        normal: {
          ...mobilityRange[movementType].normal,
          [field]: numValue,
        },
      },
    };

    // Update the parent component
    onChange(updatedMobilityRange);
  };

  // Handle removing a mobility range
  const handleRemoveMobilityRange = (movementType: string) => {
    setMovementToDelete(movementType);
    setShowDeleteDialog(true);
  };

  // Confirm and remove the mobility range
  const confirmRemoveMobilityRange = () => {
    // Create a new object without the removed range
    const { [movementToDelete]: removed, ...rest } = mobilityRange;

    // Update the parent component
    onChange(rest);

    // Close the dialog
    setShowDeleteDialog(false);
    setMovementToDelete('');
  };

  // Helper to format a movement type for display (e.g., "lateral_flexion" -> "Lateral Flexion")
  const formatMovementType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="space-y-4">
      {/* Display existing mobility ranges */}
      {Object.keys(mobilityRange).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {Object.entries(mobilityRange).map(([movementType, data]) => (
            <div
              key={movementType}
              className="border border-gray-200 rounded-lg p-4 relative"
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-900">
                  {formatMovementType(movementType)}
                </h4>
                <button
                  type="button"
                  onClick={() => handleRemoveMobilityRange(movementType)}
                  className="text-red-600 hover:text-red-900"
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min (°)
                  </label>
                  <Input
                    type="number"
                    value={(data as any).normal.min}
                    onChange={(e) =>
                      handleUpdateMobilityRange(
                        movementType,
                        'min',
                        e.target.value
                      )
                    }
                    min={-180}
                    max={180}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max (°)
                  </label>
                  <Input
                    type="number"
                    value={(data as any).normal.max}
                    onChange={(e) =>
                      handleUpdateMobilityRange(
                        movementType,
                        'max',
                        e.target.value
                      )
                    }
                    min={-180}
                    max={180}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 mb-4">
          <p className="text-sm text-yellow-800">
            No mobility ranges defined yet. Please add at least one mobility
            range.
          </p>
        </div>
      )}

      {/* Error message */}
      {error && <p className="text-sm text-red-600 mt-1 mb-2">{error}</p>}

      {/* Form to add new mobility range */}
      {isAddingNew ? (
        <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">
            Add New Mobility Range
          </h4>
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Movement Type *
              </label>
              <Select
                value={newMovementType}
                onChange={(e) => setNewMovementType(e.target.value)}
                error={
                  !newMovementType ? 'Movement type is required' : undefined
                }
              >
                <option value="">Select movement type</option>
                {availableMovementTypes.map((type) => (
                  <option key={type} value={type}>
                    {formatMovementType(type)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum (degrees) *
                </label>
                <Input
                  type="number"
                  value={newMin}
                  onChange={(e) => setNewMin(parseInt(e.target.value) || 0)}
                  min={-180}
                  max={180}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum (degrees) *
                </label>
                <Input
                  type="number"
                  value={newMax}
                  onChange={(e) => setNewMax(parseInt(e.target.value) || 0)}
                  min={-180}
                  max={180}
                  error={
                    newMax <= newMin
                      ? 'Maximum must be greater than minimum'
                      : undefined
                  }
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddMobilityRange}
              className="px-3 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              disabled={!newMovementType || newMax <= newMin}
            >
              Add Range
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAddingNew(true)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          disabled={availableMovementTypes.length === 0}
        >
          <Plus size={16} className="mr-1" />
          Add Mobility Range
        </button>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmRemoveMobilityRange}
        title="Remove Mobility Range"
        message={
          <p>
            Are you sure you want to remove the{' '}
            <span className="font-medium">
              {formatMovementType(movementToDelete)}
            </span>{' '}
            mobility range?
          </p>
        }
        confirmText="Remove"
        type="danger"
      />

      {/* Help text */}
      <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
        <p className="text-xs text-gray-600">
          <strong>Mobility Range</strong> describes the normal range of motion
          for this joint in degrees. For example, a knee's flexion might range
          from 0° to 140°. Add relevant ranges for each movement type this joint
          can perform.
        </p>
      </div>
    </div>
  );
};

export default MobilityRangeInput;
