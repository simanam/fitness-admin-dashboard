// src/components/exercises/MuscleTargetForm.tsx
import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import type { Muscle } from '../../api/muscleService';
import { Slider } from '../ui/slider';
import { Select } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';

type MuscleRole = 'primary' | 'secondary' | 'synergist' | 'stabilizer';

interface MuscleTargetFormProps {
  muscles: Muscle[];
  onSubmit: (data: {
    muscleId: string;
    role: MuscleRole;
    activationPercentage: number;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  initialData?: {
    muscleId: string;
    role: MuscleRole;
    activationPercentage: number;
  };
  editMode?: boolean;
}

const MuscleTargetForm = ({
  muscles,
  onSubmit,
  onCancel,
  isSubmitting,
  initialData,
  editMode = false,
}: MuscleTargetFormProps) => {
  const [muscleId, setMuscleId] = useState<string>(initialData?.muscleId || '');
  const [role, setRole] = useState<MuscleRole>(initialData?.role || 'primary');
  const [activationPercentage, setActivationPercentage] = useState<number>(
    initialData?.activationPercentage || 50
  );
  const [selectedMuscle, setSelectedMuscle] = useState<Muscle | null>(null);

  // Find the selected muscle to display its details
  useEffect(() => {
    if (muscleId) {
      const muscle = muscles.find((m) => m.id === muscleId) || null;
      setSelectedMuscle(muscle);
    } else {
      setSelectedMuscle(null);
    }
  }, [muscleId, muscles]);

  // Sort muscles by name for better UX
  const sortedMuscles = [...muscles].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Group muscles by muscle group for better organization
  const groupedMuscles = sortedMuscles.reduce<Record<string, Muscle[]>>(
    (acc, muscle) => {
      const groupName = muscle.muscleGroup?.name || 'Other';
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push(muscle);
      return acc;
    },
    {}
  );

  // Get step size for slider based on value range
  const getStepSize = (value: number) => {
    if (value < 10) return 1;
    if (value < 25) return 5;
    return 10;
  };

  const handleSliderChange = (value: number) => {
    setActivationPercentage(value);
  };

  const handleSubmit = async () => {
    if (!muscleId) {
      // Show validation error
      return;
    }

    await onSubmit({
      muscleId,
      role,
      activationPercentage,
    });
  };

  // Get role color for style indicators
  const getRoleColor = (
    roleType: 'primary' | 'secondary' | 'synergist' | 'stabilizer'
  ) => {
    switch (roleType) {
      case 'primary':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'secondary':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'synergist':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'stabilizer':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get activation level label based on percentage
  const getActivationLabel = (percentage: number) => {
    if (percentage >= 80) return 'Very High';
    if (percentage >= 60) return 'High';
    if (percentage >= 40) return 'Moderate';
    if (percentage >= 20) return 'Low';
    return 'Very Low';
  };

  return (
    <div className="space-y-6">
      {/* Muscle selection */}
      <div>
        <label
          htmlFor="muscleId"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Select Muscle
        </label>
        <Select
          id="muscleId"
          value={muscleId}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setMuscleId(e.target.value)
          }
          disabled={isSubmitting || editMode}
        >
          <option value="">Select a muscle</option>
          {Object.entries(groupedMuscles).map(([groupName, groupMuscles]) => (
            <optgroup key={groupName} label={groupName}>
              {groupMuscles.map((muscle) => (
                <option key={muscle.id} value={muscle.id}>
                  {muscle.name}{' '}
                  {muscle.commonName ? `(${muscle.commonName})` : ''}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>

        {selectedMuscle && (
          <div className="mt-2 p-2 bg-gray-50 rounded-lg text-sm">
            <div className="font-medium">{selectedMuscle.name}</div>
            {selectedMuscle.commonName && (
              <div className="text-gray-500">
                Also known as: {selectedMuscle.commonName}
              </div>
            )}
            {selectedMuscle.muscleGroup && (
              <div className="text-gray-500 mt-1">
                Group: {selectedMuscle.muscleGroup.name}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Role selection */}
      <div>
        <Label
          htmlFor="muscle-role"
          className="block text-sm font-medium text-gray-700 mb-3"
        >
          Muscle Role
        </Label>
        <RadioGroup
          id="muscle-role"
          value={role}
          onValueChange={(value) => setRole(value as MuscleRole)}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <div
            className={`flex items-center space-x-2 border rounded-lg p-3 ${role === 'primary' ? 'ring-2 ring-gray-900' : ''} ${getRoleColor('primary')}`}
          >
            <RadioGroupItem id="primary" value="primary" />
            <Label htmlFor="primary" className="font-medium cursor-pointer">
              Primary
            </Label>
          </div>

          <div
            className={`flex items-center space-x-2 border rounded-lg p-3 ${role === 'secondary' ? 'ring-2 ring-gray-900' : ''} ${getRoleColor('secondary')}`}
          >
            <RadioGroupItem id="secondary" value="secondary" />
            <Label htmlFor="secondary" className="font-medium cursor-pointer">
              Secondary
            </Label>
          </div>

          <div
            className={`flex items-center space-x-2 border rounded-lg p-3 ${role === 'synergist' ? 'ring-2 ring-gray-900' : ''} ${getRoleColor('synergist')}`}
          >
            <RadioGroupItem id="synergist" value="synergist" />
            <Label htmlFor="synergist" className="font-medium cursor-pointer">
              Synergist
            </Label>
          </div>

          <div
            className={`flex items-center space-x-2 border rounded-lg p-3 ${role === 'stabilizer' ? 'ring-2 ring-gray-900' : ''} ${getRoleColor('stabilizer')}`}
          >
            <RadioGroupItem id="stabilizer" value="stabilizer" />
            <Label htmlFor="stabilizer" className="font-medium cursor-pointer">
              Stabilizer
            </Label>
          </div>
        </RadioGroup>

        <div className="mt-2 text-sm text-gray-500">
          <p>
            <span className="font-medium">Primary:</span> Main muscle targeted
            by the exercise
          </p>
          <p>
            <span className="font-medium">Secondary:</span> Assisting muscles
            with moderate engagement
          </p>
          <p>
            <span className="font-medium">Synergist:</span> Muscles that assist
            in the movement
          </p>
          <p>
            <span className="font-medium">Stabilizer:</span> Muscles that help
            maintain posture during the exercise
          </p>
        </div>
      </div>

      {/* Activation percentage slider */}
      <div>
        <Label
          htmlFor="activation-percentage"
          className="block text-sm font-medium text-gray-700 mb-3"
        >
          Activation Percentage:{' '}
          <span className="text-black">{activationPercentage}%</span>
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({getActivationLabel(activationPercentage)})
          </span>
        </Label>

        <div className="px-2">
          <Slider
            id="activation-percentage"
            min={5}
            max={100}
            step={getStepSize(activationPercentage)}
            value={activationPercentage}
            onChange={handleSliderChange}
          />
        </div>

        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>Low (5%)</span>
          <span>Moderate (50%)</span>
          <span>High (100%)</span>
        </div>
      </div>

      {/* Form actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          disabled={isSubmitting || !muscleId}
        >
          {isSubmitting ? 'Saving...' : editMode ? 'Update' : 'Add'}
        </button>
      </div>
    </div>
  );
};

export default MuscleTargetForm;
