// src/components/joints/MovementEditor.tsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Motion, PLANES_OF_MOTION, COMMON_MOVEMENTS } from './MovementTypes';

interface MovementEditorProps {
  initialMovement?: Motion;
  onSave: (movement: Motion) => void;
  onCancel: () => void;
  usedMovementNames?: string[];
  isEditing?: boolean;
}

const MovementEditor: React.FC<MovementEditorProps> = ({
  initialMovement,
  onSave,
  onCancel,
  usedMovementNames = [],
  isEditing = false,
}) => {
  // Default movement state
  const defaultMovement: Motion = {
    name: '',
    plane: 'sagittal',
    range: {
      min: 0,
      max: 90,
      units: 'degrees',
    },
    description: '',
  };

  // State for the movement being edited
  const [movement, setMovement] = useState<Motion>(
    initialMovement || defaultMovement
  );

  // State for custom movement name (when selecting "custom" from dropdown)
  const [customName, setCustomName] = useState('');
  const [useCustomName, setUseCustomName] = useState(false);

  // State for validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load initial movement if provided
  useEffect(() => {
    if (initialMovement) {
      setMovement(initialMovement);
      // Check if the movement name is in our common list
      const isCustom = !COMMON_MOVEMENTS.some(
        (m) => m.value === initialMovement.name
      );
      setUseCustomName(isCustom);
      if (isCustom) {
        setCustomName(initialMovement.name);
      }
    }
  }, [initialMovement]);

  // Handle movement name change
  const handleNameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    if (value === 'custom') {
      setUseCustomName(true);
      return;
    }

    setUseCustomName(false);
    setMovement({
      ...movement,
      name: value,
    });

    // Clear name error if it exists
    if (errors.name) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.name;
        return newErrors;
      });
    }
  };

  // Handle custom name change
  const handleCustomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomName(value);

    // Update the movement name
    setMovement({
      ...movement,
      name: value,
    });

    // Clear name error if it exists and value is not empty
    if (errors.name && value.trim()) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.name;
        return newErrors;
      });
    }
  };

  // Handle plane change
  const handlePlaneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMovement({
      ...movement,
      plane: e.target.value as Motion['plane'],
    });
  };

  // Handle range changes
  const handleRangeChange = (field: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0;

    setMovement({
      ...movement,
      range: {
        ...movement.range,
        [field]: numValue,
      },
    });

    // Clear range error if fixing min/max relationship
    if (errors.range && field === 'max' && numValue > movement.range.min) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.range;
        return newErrors;
      });
    }
  };

  // Handle description change
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setMovement({
      ...movement,
      description: e.target.value,
    });
  };

  // Validate the movement before saving
  const validateMovement = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Check name
    const effectiveName = useCustomName ? customName : movement.name;
    if (!effectiveName.trim()) {
      newErrors.name = 'Movement name is required';
    } else if (!isEditing && usedMovementNames.includes(effectiveName)) {
      newErrors.name = 'This movement already exists';
    }

    // Check range
    if (movement.range.max <= movement.range.min) {
      newErrors.range = 'Maximum range must be greater than minimum range';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateMovement()) {
      return;
    }

    // Use the custom name if selected
    const finalMovement = {
      ...movement,
      name: useCustomName ? customName : movement.name,
    };

    onSave(finalMovement);
  };

  // Filter out already used movement names for the dropdown
  const availableMovements = COMMON_MOVEMENTS.filter(
    (movement) => isEditing || !usedMovementNames.includes(movement.value)
  );

  return (
    <div className="bg-white border border-blue-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {isEditing ? 'Edit Movement' : 'Add New Movement'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Movement Name
          </label>
          <Select
            value={useCustomName ? 'custom' : movement.name}
            onChange={handleNameChange}
            error={errors.name}
          >
            <option value="">Select a movement</option>
            {availableMovements.map((movement) => (
              <option key={movement.value} value={movement.value}>
                {movement.label}
              </option>
            ))}
            <option value="custom">Custom Movement</option>
          </Select>

          {useCustomName && (
            <Input
              className="mt-2"
              value={customName}
              onChange={handleCustomNameChange}
              placeholder="Enter custom movement name"
              error={errors.name}
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plane of Motion
          </label>
          <Select value={movement.plane} onChange={handlePlaneChange}>
            {PLANES_OF_MOTION.map((plane) => (
              <option key={plane.value} value={plane.value}>
                {plane.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Range (°)
            </label>
            <Input
              type="number"
              value={movement.range.min}
              onChange={(e) => handleRangeChange('min', e.target.value)}
              min={-180}
              max={180}
              error={errors.range}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Range (°)
            </label>
            <Input
              type="number"
              value={movement.range.max}
              onChange={(e) => handleRangeChange('max', e.target.value)}
              min={-180}
              max={180}
              error={errors.range}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <Textarea
            value={movement.description || ''}
            onChange={handleDescriptionChange}
            placeholder="Describe this movement in more detail"
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {isEditing ? 'Update Movement' : 'Add Movement'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MovementEditor;
