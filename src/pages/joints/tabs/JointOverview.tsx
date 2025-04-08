// src/pages/joints/tabs/JointOverview.tsx
import React from 'react';
import { Info, AlertCircle } from 'lucide-react';
import { Joint } from '../../../api/jointService';

interface JointOverviewProps {
  joint: Joint;
}

const JointOverview: React.FC<JointOverviewProps> = ({ joint }) => {
  // Count the number of movement planes in this joint
  const movementPlanes = new Set(
    joint.movements.primary.map((movement) => movement.plane)
  );

  // Get primary and accessory movement count
  const primaryMovementsCount = joint.movements.primary.length;
  const accessoryMovementsCount = joint.movements.accessory.length;

  // Get mobility range count
  const mobilityRangeCount = Object.keys(joint.mobilityRange).length;

  return (
    <div className="space-y-8">
      {/* Description */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
          <Info className="h-5 w-5 mr-2 text-gray-500" />
          Description
        </h3>
        {joint.description ? (
          <div className="prose max-w-none">
            <p className="text-gray-700">{joint.description}</p>
          </div>
        ) : (
          <p className="text-gray-500 italic">No description provided.</p>
        )}
      </div>

      {/* Movement Summary */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
          <span className="mr-2">🔄</span>
          Movement Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">
              Joint Type
            </h4>
            <p className="text-gray-900 capitalize">
              {joint.type.replace(/_/g, ' ')}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">
              Movement Planes
            </h4>
            <p className="text-gray-900">{movementPlanes.size}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">
              Primary Movements
            </h4>
            <p className="text-gray-900">{primaryMovementsCount}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">
              Accessory Movements
            </h4>
            <p className="text-gray-900">{accessoryMovementsCount}</p>
          </div>
        </div>
      </div>

      {/* Primary Movements */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Primary Movements
        </h3>
        {joint.movements.primary.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {joint.movements.primary.map((movement, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <h4 className="font-medium text-gray-900 capitalize">
                  {movement.name}
                </h4>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Plane:</span>
                    <span className="font-medium capitalize">
                      {movement.plane}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Range:</span>
                    <span className="font-medium">
                      {movement.range.min}° to {movement.range.max}°
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-yellow-700">
              No primary movements defined for this joint.
            </p>
          </div>
        )}
      </div>

      {/* Accessory Movements */}
      {joint.movements.accessory.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Accessory Movements
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <ul className="space-y-2 list-disc list-inside text-gray-700">
              {joint.movements.accessory.map((movement, index) => (
                <li key={index} className="capitalize">
                  {movement}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Mobility Range Summary */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Mobility Range Summary
        </h3>
        {mobilityRangeCount > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(joint.mobilityRange).map(
              ([movementType, rangeData]) => (
                <div
                  key={movementType}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <h4 className="font-medium text-gray-900 capitalize">
                    {movementType}
                  </h4>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Normal Range:</span>
                      <span className="font-medium">
                        {rangeData.normal.min}° to {rangeData.normal.max}°
                      </span>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-yellow-700">
              No mobility range data defined for this joint.
            </p>
          </div>
        )}
      </div>

      {/* Note for more details */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <p className="text-blue-700 text-sm">
          For more detailed information about mobility ranges and movements,
          visit the respective tabs above.
        </p>
      </div>
    </div>
  );
};

export default JointOverview;
