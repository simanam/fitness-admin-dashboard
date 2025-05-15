// src/components/exercises/JointInvolvementForm.tsx
import { useState, useEffect } from 'react';

import { Select } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Joint } from '../../api/jointService';

interface JointInvolvementFormProps {
  joints: Joint[];
  exerciseId: string;
  onSubmit: (data: {
    exerciseId: string;
    jointId: string;
    movementType: string;
    romRequired?: number;
    isPrimary?: boolean;
    movementNotes?: string;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  initialData?: {
    jointId: string;
    movementType: string;
    romRequired?: number;
    isPrimary?: boolean;
    movementNotes?: string;
  };
  editMode?: boolean;
}

const JointInvolvementForm = ({
  joints,
  exerciseId,
  onSubmit,
  onCancel,
  isSubmitting,
  initialData,
  editMode = false,
}: JointInvolvementFormProps) => {
  const [jointId, setJointId] = useState<string>(initialData?.jointId || '');
  const [movementType, setMovementType] = useState<string>(
    initialData?.movementType || ''
  );
  const [romRequired, setRomRequired] = useState<number>(
    initialData?.romRequired || 90
  );
  const [isPrimary, setIsPrimary] = useState<boolean>(
    initialData?.isPrimary ?? true
  );
  const [movementNotes, setMovementNotes] = useState<string>(
    initialData?.movementNotes || ''
  );
  const [selectedJoint, setSelectedJoint] = useState<Joint | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [localSubmitting, setLocalSubmitting] = useState<boolean>(false);

  // Find the selected joint to display its details
  useEffect(() => {
    if (jointId) {
      const joint = joints.find((j) => j.id === jointId) || null;
      setSelectedJoint(joint);
    } else {
      setSelectedJoint(null);
    }
  }, [jointId, joints]);

  // Common movement patterns for joints
  const commonMovementPatterns = [
    'flexion',
    'extension',
    'abduction',
    'adduction',
    'rotation',
    'internal_rotation',
    'external_rotation',
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
    'dorsiflexion',
    'plantarflexion',
    'opposition',
  ];

  const validateForm = (): boolean => {
    if (!jointId) {
      setValidationError('Please select a joint');
      return false;
    }
    if (!movementType || movementType.trim() === '') {
      setValidationError('Please select a movement type');
      return false;
    }
    if (
      romRequired !== undefined &&
      (Number.isNaN(romRequired) || romRequired < 0)
    ) {
      setValidationError('ROM Required must be a positive number');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateForm()) {
      return;
    }

    setLocalSubmitting(true);

    try {
      const formData = {
        exerciseId,
        jointId,
        movementType: movementType,
        romRequired: romRequired || undefined,
        isPrimary: isPrimary ?? true,
        movementNotes: movementNotes || undefined,
      };

      // Log the data being sent
      console.log('Submitting form data:', formData);

      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setValidationError(
        'An error occurred while submitting the form. Please try again.'
      );
    } finally {
      setLocalSubmitting(false);
    }
  };

  // Get involvement type color for style indicators
  const getInvolvementTypeColor = (type: 'primary' | 'secondary') => {
    switch (type) {
      case 'primary':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'secondary':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isFormSubmitting = isSubmitting || localSubmitting;

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      {/* Validation error message */}
      {validationError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {validationError}
        </div>
      )}

      {/* Joint selection */}
      <div>
        <label
          htmlFor="jointId"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Select Joint <span className="text-red-500">*</span>
        </label>
        <Select
          id="jointId"
          value={jointId}
          onChange={(e) => setJointId(e.target.value)}
          disabled={isFormSubmitting || editMode}
        >
          <option value="">Select a joint</option>
          {joints.map((joint) => (
            <option key={joint.id} value={joint.id}>
              {joint.name} ({joint.type})
            </option>
          ))}
        </Select>

        {selectedJoint && (
          <div className="mt-2 p-2 bg-gray-50 rounded-lg text-sm">
            <div className="font-medium">{selectedJoint.name}</div>
            <div className="text-gray-500">Type: {selectedJoint.type}</div>
            {selectedJoint.description && (
              <div className="text-gray-500 mt-1">
                {selectedJoint.description}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Movement type selection */}
      <div>
        <label
          htmlFor="movementType"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Movement Type <span className="text-red-500">*</span>
        </label>
        <Select
          id="movementType"
          value={movementType}
          onChange={(e) => {
            const value = e.target.value;
            console.log('Selected movement type:', value); // Debug log
            setMovementType(value);
          }}
          disabled={isFormSubmitting}
          required
        >
          <option value="">Select a movement type</option>
          {commonMovementPatterns.map((pattern) => (
            <option key={pattern} value={pattern}>
              {pattern
                .replace('_', ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </option>
          ))}
          <option value="other">Other (specify in notes)</option>
        </Select>
      </div>

      {/* ROM Required input */}
      <div>
        <label
          htmlFor="romRequired"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          ROM Required (degrees)
        </label>
        <input
          id="romRequired"
          type="number"
          value={romRequired}
          onChange={(e) => setRomRequired(Number.parseInt(e.target.value) || 0)}
          min={0}
          max={180}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
          disabled={isFormSubmitting}
        />
      </div>

      {/* Primary/Secondary selection */}
      <div>
        <label
          htmlFor="jointRole"
          className="block text-sm font-medium text-gray-700 mb-3"
        >
          Joint Role
        </label>
        <RadioGroup
          id="jointRole"
          value={isPrimary ? 'primary' : 'secondary'}
          onValueChange={(value) => setIsPrimary(value === 'primary')}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <div
            className={`flex items-center space-x-2 border rounded-lg p-3 ${
              isPrimary ? 'ring-2 ring-gray-900' : ''
            } ${getInvolvementTypeColor('primary')}`}
          >
            <RadioGroupItem id="primary" value="primary" />
            <Label htmlFor="primary" className="font-medium cursor-pointer">
              Primary
            </Label>
          </div>

          <div
            className={`flex items-center space-x-2 border rounded-lg p-3 ${
              !isPrimary ? 'ring-2 ring-gray-900' : ''
            } ${getInvolvementTypeColor('secondary')}`}
          >
            <RadioGroupItem id="secondary" value="secondary" />
            <Label htmlFor="secondary" className="font-medium cursor-pointer">
              Secondary
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Movement Notes input */}
      <div>
        <label
          htmlFor="movementNotes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Movement Notes (Optional)
        </label>
        <Textarea
          id="movementNotes"
          value={movementNotes}
          onChange={(e) => setMovementNotes(e.target.value)}
          placeholder="Add notes about the joint's role, positioning, or special considerations"
          rows={3}
          disabled={isFormSubmitting}
        />
      </div>

      {/* Form actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          disabled={isFormSubmitting}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          // disabled={isFormSubmitting || !jointId || !movementType}
        >
          {isFormSubmitting ? 'Saving...' : editMode ? 'Update' : 'Add'}
        </button>
      </div>
    </form>
  );
};
export default JointInvolvementForm;
