// src/components/exercises/JointInvolvementForm.tsx
import { useState, useEffect } from 'react';

import { Select } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Joint } from '../../api/jointService';

interface JointInvolvementFormProps {
  joints: Joint[];
  onSubmit: (data: {
    jointId: string;
    involvementType: 'primary' | 'secondary';
    movementPattern: string;
    rangeOfMotion: {
      min: number;
      max: number;
      units: string;
    };
    notes?: string;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  initialData?: {
    jointId: string;
    involvementType: 'primary' | 'secondary';
    movementPattern: string;
    rangeOfMotion: {
      min: number;
      max: number;
      units: string;
    };
    notes?: string;
  };
  editMode?: boolean;
}

const JointInvolvementForm = ({
  joints,
  onSubmit,
  onCancel,
  isSubmitting,
  initialData,
  editMode = false,
}: JointInvolvementFormProps) => {
  const [jointId, setJointId] = useState<string>(initialData?.jointId || '');
  const [involvementType, setInvolvementType] = useState<
    'primary' | 'secondary'
  >(initialData?.involvementType || 'primary');
  const [movementPattern, setMovementPattern] = useState<string>(
    initialData?.movementPattern || ''
  );
  const [rangeMin, setRangeMin] = useState<number>(
    initialData?.rangeOfMotion?.min || 0
  );
  const [rangeMax, setRangeMax] = useState<number>(
    initialData?.rangeOfMotion?.max || 90
  );
  const [notes, setNotes] = useState<string>(initialData?.notes || '');
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
    if (!movementPattern) {
      setValidationError('Please select a movement pattern');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    // Prevent default button behavior
    e.preventDefault();
    e.stopPropagation();

    // Validate the form
    if (!validateForm()) {
      return;
    }

    // Set local submitting state to show loading indicator
    setLocalSubmitting(true);

    try {
      // Call the onSubmit function passed as prop
      await onSubmit({
        jointId,
        involvementType,
        movementPattern,
        rangeOfMotion: {
          min: rangeMin,
          max: rangeMax,
          units: 'degrees',
        },
        notes: notes || undefined,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setValidationError(
        'An error occurred while submitting the form. Please try again.'
      );
    } finally {
      // Reset local submitting state
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

      {/* Involvement type selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Involvement Type <span className="text-red-500">*</span>
        </label>
        <RadioGroup
          value={involvementType}
          onValueChange={(value) =>
            setInvolvementType(value as 'primary' | 'secondary')
          }
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <div
            className={`flex items-center space-x-2 border rounded-lg p-3 ${
              involvementType === 'primary' ? 'ring-2 ring-gray-900' : ''
            } ${getInvolvementTypeColor('primary')}`}
          >
            <RadioGroupItem id="primary" value="primary" />
            <Label htmlFor="primary" className="font-medium cursor-pointer">
              Primary
            </Label>
          </div>

          <div
            className={`flex items-center space-x-2 border rounded-lg p-3 ${
              involvementType === 'secondary' ? 'ring-2 ring-gray-900' : ''
            } ${getInvolvementTypeColor('secondary')}`}
          >
            <RadioGroupItem id="secondary" value="secondary" />
            <Label htmlFor="secondary" className="font-medium cursor-pointer">
              Secondary
            </Label>
          </div>
        </RadioGroup>

        <div className="mt-2 text-sm text-gray-500">
          <p>
            <span className="font-medium">Primary:</span> Joint is central to
            the exercise movement
          </p>
          <p>
            <span className="font-medium">Secondary:</span> Joint provides
            support or stability during the exercise
          </p>
        </div>
      </div>

      {/* Movement pattern selection */}
      <div>
        <label
          htmlFor="movementPattern"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Movement Pattern <span className="text-red-500">*</span>
        </label>
        <Select
          id="movementPattern"
          value={movementPattern}
          onChange={(e) => setMovementPattern(e.target.value)}
          disabled={isFormSubmitting}
        >
          <option value="">Select a movement pattern</option>
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

      {/* Range of motion input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Range of Motion (degrees) <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-700 mb-1">Minimum</label>
            <input
              type="number"
              value={rangeMin}
              onChange={(e) => setRangeMin(parseInt(e.target.value) || 0)}
              min={-180}
              max={180}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
              disabled={isFormSubmitting}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 mb-1">Maximum</label>
            <input
              type="number"
              value={rangeMax}
              onChange={(e) => setRangeMax(parseInt(e.target.value) || 0)}
              min={-180}
              max={180}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
              disabled={isFormSubmitting}
            />
          </div>
        </div>

        {/* Range visualization */}
        <div className="mt-2 mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>-180°</span>
            <span>0°</span>
            <span>+180°</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full relative">
            <div
              className="absolute h-full bg-blue-500 rounded-full"
              style={{
                left: `${((rangeMin + 180) / 360) * 100}%`,
                width: `${((rangeMax - rangeMin) / 360) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
      {/* Notes input */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Notes (Optional)
        </label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
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
          // disabled={isFormSubmitting || !jointId || !movementPattern}
        >
          {isFormSubmitting ? 'Saving...' : editMode ? 'Update' : 'Add'}
        </button>
      </div>
    </form>
  );
};
export default JointInvolvementForm;
