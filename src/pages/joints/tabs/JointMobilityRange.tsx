// src/pages/joints/tabs/JointMobilityRange.tsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Save } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import { Joint } from '../../../api/jointService';
import jointService from '../../../api/jointService';
import MobilityRangeInput from '../../../components/joints/MobilityRangeInput';

interface JointMobilityRangeProps {
  joint: Joint;
  setJoint: React.Dispatch<React.SetStateAction<Joint | null>>;
}

const JointMobilityRange: React.FC<JointMobilityRangeProps> = ({
  joint,
  setJoint,
}) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mobilityRange, setMobilityRange] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);

  // Initialize mobility range from joint data
  useEffect(() => {
    setMobilityRange({ ...joint.mobilityRange });
  }, [joint]);

  // Handle save button click
  const handleSaveMobilityRange = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedJoint = await jointService.updateMobilityRange(
        joint.id,
        mobilityRange
      );

      // Update the joint state with the updated data
      setJoint(updatedJoint);
      setIsEditing(false);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Mobility range updated successfully',
      });
    } catch (error) {
      console.error('Error updating mobility range:', error);
      setError('Failed to update mobility range. Please try again.');

      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update mobility range',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle mobility range changes from the input component
  const handleMobilityRangeChange = (newMobilityRange: Record<string, any>) => {
    setMobilityRange(newMobilityRange);
  };

  // Enter edit mode
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Cancel editing and revert changes
  const handleCancel = () => {
    setMobilityRange({ ...joint.mobilityRange });
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header with title and edit/save buttons */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Mobility Range</h3>
        <div className="space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMobilityRange}
                className="px-3 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Edit Mobility Range
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <AlertTriangle className="inline-block mr-2 h-5 w-5" />
          {error}
        </div>
      )}

      {/* No mobility range data message */}
      {Object.keys(mobilityRange).length === 0 && !isEditing && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-yellow-700">
              No mobility range data defined for this joint.
            </p>
            <button
              onClick={handleEdit}
              className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Add Mobility Range
            </button>
          </div>
        </div>
      )}

      {/* Mobility range input component - only show when editing or there's data */}
      {(isEditing || Object.keys(mobilityRange).length > 0) && (
        <div className={!isEditing ? 'hidden' : ''}>
          <MobilityRangeInput
            mobilityRange={mobilityRange}
            onChange={handleMobilityRangeChange}
            error={error || undefined}
          />
        </div>
      )}

      {/* Read-only visualization when not editing and data exists */}
      {!isEditing && Object.keys(mobilityRange).length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
          <h4 className="font-medium text-gray-900 mb-4">
            Mobility Range Visualization
          </h4>
          <div className="space-y-4">
            {Object.entries(mobilityRange).map(([movementType, data]) => {
              // Safely access nested properties
              const min = data?.normal?.min ?? 0;
              const max = data?.normal?.max ?? 0;

              return (
                <div
                  key={movementType}
                  className="border border-gray-200 bg-white rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-medium text-gray-900 capitalize">
                      {movementType.replace(/_/g, ' ')}
                    </h5>
                    <span className="text-sm text-gray-500">
                      {min}° to {max}°
                    </span>
                  </div>
                  <div className="h-8 w-full bg-gray-100 rounded-full overflow-hidden relative">
                    <div
                      className={`absolute h-full ${getRangeColor(min, max)}`}
                      style={{
                        left: `${((min + 180) / 360) * 100}%`,
                        width: `${((max - min) / 360) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reference information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
        <h4 className="font-medium text-gray-900 mb-2">
          Reference Information
        </h4>
        <p className="text-sm text-gray-600">
          The mobility range represents the normal range of motion for this
          joint, measured in degrees. These values are useful for exercise
          developers to ensure movements stay within safe parameters.
        </p>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-sm">
            <div className="font-medium text-gray-700">Limited Range</div>
            <div className="mt-1 h-3 w-full bg-red-100 border border-red-200 rounded"></div>
            <div className="text-xs text-gray-500 mt-1">0° - 30°</div>
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-700">Moderate Range</div>
            <div className="mt-1 h-3 w-full bg-yellow-100 border border-yellow-200 rounded"></div>
            <div className="text-xs text-gray-500 mt-1">30° - 60°</div>
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-700">Extensive Range</div>
            <div className="mt-1 h-3 w-full bg-green-100 border border-green-200 rounded"></div>
            <div className="text-xs text-gray-500 mt-1">60° and above</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate a color based on range percentage
const getRangeColor = (min: number, max: number) => {
  const range = max - min;
  // Higher range = more mobility = more green
  if (range > 150) return 'bg-green-100 border-green-200';
  if (range > 100) return 'bg-green-50 border-green-100';
  if (range > 60) return 'bg-blue-50 border-blue-100';
  if (range > 30) return 'bg-yellow-50 border-yellow-100';
  return 'bg-red-50 border-red-100';
};

export default JointMobilityRange;
