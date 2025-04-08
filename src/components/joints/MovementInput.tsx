// src/components/joints/MovementInput.tsx
import React, { useState } from 'react';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Textarea } from '../ui/textarea';
import ConfirmationDialog from '../ui/confirmation-dialog';

interface PrimaryMovement {
  name: string;
  plane: string;
  range: {
    min: number;
    max: number;
    units: string;
  };
}

interface MovementInputProps {
  movements: {
    primary: PrimaryMovement[];
    accessory: string[];
  };
  onChange: (movements: {
    primary: PrimaryMovement[];
    accessory: string[];
  }) => void;
  error?: string;
}

const MovementInput: React.FC<MovementInputProps> = ({
  movements,
  onChange,
  error,
}) => {
  // State for adding new movements
  const [isAddingPrimary, setIsAddingPrimary] = useState(false);
  const [isAddingAccessory, setIsAddingAccessory] = useState(false);

  // State for new primary movement
  const [newPrimaryMovement, setNewPrimaryMovement] = useState<PrimaryMovement>(
    {
      name: '',
      plane: 'sagittal',
      range: {
        min: 0,
        max: 0,
        units: 'degrees',
      },
    }
  );

  // State for new accessory movement
  const [newAccessoryMovement, setNewAccessoryMovement] = useState('');

  // State for deletion confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [movementToDelete, setMovementToDelete] = useState<{
    type: 'primary' | 'accessory';
    index: number;
  } | null>(null);

  // Available movement planes
  const movementPlanes = [
    { value: 'sagittal', label: 'Sagittal (Forward/Backward)' },
    { value: 'frontal', label: 'Frontal (Side to Side)' },
    { value: 'transverse', label: 'Transverse (Rotational)' },
    { value: 'multi-planar', label: 'Multi-planar' },
  ];

  // Common movement names
  const commonMovementNames = [
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
  ].filter((name) => !movements.primary.some((m) => m.name === name));

  // Handle adding a new primary movement
  const handleAddPrimaryMovement = () => {
    if (!newPrimaryMovement.name) {
      return; // Validation should prevent this
    }

    if (newPrimaryMovement.range.max <= newPrimaryMovement.range.min) {
      return; // Validation should prevent this
    }

    // Create updated movements object
    const updatedMovements = {
      ...movements,
      primary: [...movements.primary, { ...newPrimaryMovement }],
    };

    // Update parent component
    onChange(updatedMovements);

    // Reset form
    setNewPrimaryMovement({
      name: '',
      plane: 'sagittal',
      range: {
        min: 0,
        max: 0,
        units: 'degrees',
      },
    });
    setIsAddingPrimary(false);
  };

  // Handle adding a new accessory movement
  const handleAddAccessoryMovement = () => {
    if (!newAccessoryMovement.trim()) {
      return; // Validation should prevent this
    }

    // Create updated movements object
    const updatedMovements = {
      ...movements,
      accessory: [...movements.accessory, newAccessoryMovement.trim()],
    };

    // Update parent component
    onChange(updatedMovements);

    // Reset form
    setNewAccessoryMovement('');
    setIsAddingAccessory(false);
  };

  // Handle removing a movement
  const handleRemoveMovement = (
    type: 'primary' | 'accessory',
    index: number
  ) => {
    setMovementToDelete({ type, index });
    setShowDeleteDialog(true);
  };

  // Confirm and remove the movement
  const confirmRemoveMovement = () => {
    if (!movementToDelete) return;

    if (movementToDelete.type === 'primary') {
      // Remove primary movement
      const updatedPrimary = [...movements.primary];
      updatedPrimary.splice(movementToDelete.index, 1);

      onChange({
        ...movements,
        primary: updatedPrimary,
      });
    } else {
      // Remove accessory movement
      const updatedAccessory = [...movements.accessory];
      updatedAccessory.splice(movementToDelete.index, 1);

      onChange({
        ...movements,
        accessory: updatedAccessory,
      });
    }

    setShowDeleteDialog(false);
    setMovementToDelete(null);
  };

  // Update a primary movement field
  const handleUpdatePrimaryMovement = (
    index: number,
    field: keyof PrimaryMovement,
    value: string | number
  ) => {
    const updatedPrimary = [...movements.primary];

    if (field === 'name' || field === 'plane') {
      updatedPrimary[index][field] = value as string;
    } else if (field === 'range') {
      // This won't be called directly but included for completeness
      updatedPrimary[index].range = value as any;
    }

    onChange({
      ...movements,
      primary: updatedPrimary,
    });
  };

  // Update a range field in a primary movement
  const handleRangeChange = (
    index: number,
    field: 'min' | 'max',
    value: string
  ) => {
    const numValue = parseInt(value, 10) || 0;
    const updatedPrimary = [...movements.primary];

    updatedPrimary[index].range = {
      ...updatedPrimary[index].range,
      [field]: numValue,
    };

    onChange({
      ...movements,
      primary: updatedPrimary,
    });
  };

  // Format a movement name for display
  const formatMovementName = (name: string) => {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Primary Movements Section */}
      <div>
        <h3 className="text-md font-medium text-gray-800 mb-3">
          Primary Movements
        </h3>

        {movements.primary.length === 0 && !isAddingPrimary ? (
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start mb-4">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-yellow-700">
              No primary movements defined yet. Primary movements are the main
              movements this joint can perform.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mb-4">
            {/* List of primary movements */}
            {movements.primary.map((movement, index) => (
              <div
                key={`primary-${index}`}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900 capitalize">
                    {formatMovementName(movement.name)}
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleRemoveMovement('primary', index)}
                    className="text-red-600 hover:text-red-900"
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Movement Name
                    </label>
                    <Input
                      value={movement.name}
                      onChange={(e) =>
                        handleUpdatePrimaryMovement(
                          index,
                          'name',
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plane of Motion
                    </label>
                    <Select
                      value={movement.plane}
                      onChange={(e) =>
                        handleUpdatePrimaryMovement(
                          index,
                          'plane',
                          e.target.value
                        )
                      }
                    >
                      {movementPlanes.map((plane) => (
                        <option key={plane.value} value={plane.value}>
                          {plane.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Min Range (°)
                      </label>
                      <Input
                        type="number"
                        value={movement.range.min}
                        onChange={(e) =>
                          handleRangeChange(index, 'min', e.target.value)
                        }
                        min={-180}
                        max={180}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Range (°)
                      </label>
                      <Input
                        type="number"
                        value={movement.range.max}
                        onChange={(e) =>
                          handleRangeChange(index, 'max', e.target.value)
                        }
                        min={-180}
                        max={180}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error message */}
        {error && <p className="text-sm text-red-600 mt-1 mb-3">{error}</p>}

        {/* Add Primary Movement Form */}
        {isAddingPrimary ? (
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-3">
              Add Primary Movement
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Movement Name *
                </label>
                <Select
                  value={newPrimaryMovement.name}
                  onChange={(e) =>
                    setNewPrimaryMovement({
                      ...newPrimaryMovement,
                      name: e.target.value,
                    })
                  }
                  error={
                    !newPrimaryMovement.name
                      ? 'Movement name is required'
                      : undefined
                  }
                >
                  <option value="">Select a movement</option>
                  {commonMovementNames.map((name) => (
                    <option key={name} value={name}>
                      {formatMovementName(name)}
                    </option>
                  ))}
                  <option value="custom">Custom (enter below)</option>
                </Select>
                {newPrimaryMovement.name === 'custom' && (
                  <Input
                    className="mt-2"
                    placeholder="Enter custom movement name"
                    onChange={(e) =>
                      setNewPrimaryMovement({
                        ...newPrimaryMovement,
                        name: e.target.value,
                      })
                    }
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plane of Motion *
                </label>
                <Select
                  value={newPrimaryMovement.plane}
                  onChange={(e) =>
                    setNewPrimaryMovement({
                      ...newPrimaryMovement,
                      plane: e.target.value,
                    })
                  }
                >
                  {movementPlanes.map((plane) => (
                    <option key={plane.value} value={plane.value}>
                      {plane.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Range (°) *
                  </label>
                  <Input
                    type="number"
                    value={newPrimaryMovement.range.min}
                    onChange={(e) =>
                      setNewPrimaryMovement({
                        ...newPrimaryMovement,
                        range: {
                          ...newPrimaryMovement.range,
                          min: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    min={-180}
                    max={180}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Range (°) *
                  </label>
                  <Input
                    type="number"
                    value={newPrimaryMovement.range.max}
                    onChange={(e) =>
                      setNewPrimaryMovement({
                        ...newPrimaryMovement,
                        range: {
                          ...newPrimaryMovement.range,
                          max: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    min={-180}
                    max={180}
                    error={
                      newPrimaryMovement.range.max <=
                      newPrimaryMovement.range.min
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
                onClick={() => setIsAddingPrimary(false)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddPrimaryMovement}
                className="px-3 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                disabled={
                  !newPrimaryMovement.name ||
                  newPrimaryMovement.range.max <= newPrimaryMovement.range.min
                }
              >
                Add Movement
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingPrimary(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mb-4"
          >
            <Plus size={16} className="mr-1" />
            Add Primary Movement
          </button>
        )}
      </div>

      {/* Accessory Movements Section */}
      <div>
        <h3 className="text-md font-medium text-gray-800 mb-3">
          Accessory Movements
        </h3>

        {movements.accessory.length === 0 && !isAddingAccessory ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start mb-4">
            <AlertTriangle className="h-5 w-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-gray-600">
              No accessory movements defined yet. Accessory movements are
              secondary, supporting movements the joint can perform.
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <ul className="space-y-2">
              {movements.accessory.map((movement, index) => (
                <li
                  key={`accessory-${index}`}
                  className="flex justify-between items-center"
                >
                  <span className="text-gray-700">{movement}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMovement('accessory', index)}
                    className="text-red-600 hover:text-red-900"
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Add Accessory Movement Form */}
        {isAddingAccessory ? (
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-3">
              Add Accessory Movement
            </h4>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Movement Description *
              </label>
              <Textarea
                value={newAccessoryMovement}
                onChange={(e) => setNewAccessoryMovement(e.target.value)}
                placeholder="Describe the accessory movement (e.g., 'slight rotation when flexed')"
                rows={3}
                error={
                  !newAccessoryMovement.trim()
                    ? 'Movement description is required'
                    : undefined
                }
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAddingAccessory(false)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddAccessoryMovement}
                className="px-3 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                disabled={!newAccessoryMovement.trim()}
              >
                Add Movement
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingAccessory(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Plus size={16} className="mr-1" />
            Add Accessory Movement
          </button>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setMovementToDelete(null);
        }}
        onConfirm={confirmRemoveMovement}
        title={`Remove ${
          movementToDelete?.type === 'primary' ? 'Primary' : 'Accessory'
        } Movement`}
        message={
          <p>
            Are you sure you want to remove this{' '}
            {movementToDelete?.type === 'primary' ? 'primary' : 'accessory'}{' '}
            movement?
          </p>
        }
        confirmText="Remove"
        type="danger"
      />

      {/* Help text */}
      <div className="mt-6 p-3 bg-gray-50 rounded-md border border-gray-200">
        <p className="text-xs text-gray-600">
          <strong>Primary Movements</strong> are the main movements a joint is
          designed to perform (like flexion or extension). They have a specific
          name, plane of motion, and range.
          <br />
          <br />
          <strong>Accessory Movements</strong> are secondary movements that
          might occur alongside primary movements or represent small additional
          movements. They're described qualitatively.
        </p>
      </div>
    </div>
  );
};

export default MovementInput;
