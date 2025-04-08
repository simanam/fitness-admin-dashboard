// src/components/joints/MovementVisualization.tsx
import React from 'react';
import { ArrowRight, Info } from 'lucide-react';
import {
  Motion,
  getPlaneColor,
  getRangeCategory,
  getRangeCategoryColor,
} from './MovementTypes';

interface MovementVisualizationProps {
  movements: Motion[];
  onSelectMovement?: (movement: Motion) => void;
  className?: string;
}

const MovementVisualization: React.FC<MovementVisualizationProps> = ({
  movements,
  onSelectMovement,
  className = '',
}) => {
  // No movements to visualize
  if (!movements || movements.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-500">No movements available to visualize</p>
      </div>
    );
  }

  // Group movements by plane for better visualization
  const groupedByPlane: Record<string, Motion[]> = {};

  movements.forEach((movement) => {
    if (!groupedByPlane[movement.plane]) {
      groupedByPlane[movement.plane] = [];
    }
    groupedByPlane[movement.plane].push(movement);
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Movement by plane visualization */}
      {Object.entries(groupedByPlane).map(([plane, planeMovements]) => (
        <div
          key={plane}
          className="bg-white border border-gray-200 rounded-lg p-4"
        >
          <h3
            className={`text-md font-medium mb-3 capitalize ${getPlaneColor(plane)} inline-block px-3 py-1 rounded-full`}
          >
            {plane.replace(/_/g, ' ')} Plane
          </h3>

          <div className="space-y-4">
            {planeMovements.map((movement, idx) => (
              <div
                key={`${movement.name}-${idx}`}
                className={`border rounded-lg p-4 ${
                  onSelectMovement ? 'cursor-pointer hover:bg-gray-50' : ''
                }`}
                onClick={
                  onSelectMovement
                    ? () => onSelectMovement(movement)
                    : undefined
                }
              >
                <h4 className="font-medium text-gray-900 capitalize">
                  {movement.name.replace(/_/g, ' ')}
                </h4>

                {/* Range visualization */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>-180°</span>
                    <span>0°</span>
                    <span>+180°</span>
                  </div>

                  <div className="h-8 bg-gray-100 rounded-full relative overflow-hidden">
                    {/* Zero mark */}
                    <div
                      className="absolute h-full w-px bg-gray-400"
                      style={{ left: '50%' }}
                    ></div>

                    {/* Range indicator */}
                    <div
                      className={`absolute h-full ${getRangeCategoryColor(getRangeCategory(movement.range.min, movement.range.max))}`}
                      style={{
                        left: `${((movement.range.min + 180) / 360) * 100}%`,
                        width: `${((movement.range.max - movement.range.min) / 360) * 100}%`,
                      }}
                    ></div>

                    {/* Min/max labels */}
                    <div className="absolute inset-0 flex items-center justify-between px-2">
                      <div className="text-xs font-medium bg-white px-1 rounded border border-gray-200 shadow-sm">
                        {movement.range.min}°
                      </div>
                      <div className="text-xs font-medium bg-white px-1 rounded border border-gray-200 shadow-sm">
                        {movement.range.max}°
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center mt-2 text-sm">
                    <span className="text-gray-500">Range:</span>
                    <span className="font-medium ml-2 flex items-center">
                      {movement.range.min}°
                      <ArrowRight size={14} className="mx-1" />
                      {movement.range.max}°
                    </span>
                    <span className="ml-2 text-gray-500">
                      ({movement.range.max - movement.range.min}° total)
                    </span>
                  </div>
                </div>

                {/* Description if available */}
                {movement.description && (
                  <div className="mt-2 text-sm text-gray-600 flex items-start">
                    <Info
                      size={16}
                      className="mr-1 text-gray-400 flex-shrink-0 mt-0.5"
                    />
                    <p>{movement.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Summary of range of motion by plane */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-md font-medium mb-3">Range of Motion Summary</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(groupedByPlane).map(([plane, planeMovements]) => {
            // Calculate total range for this plane
            const totalRange = planeMovements.reduce(
              (sum, movement) =>
                sum + (movement.range.max - movement.range.min),
              0
            );

            // Calculate average range
            const avgRange = totalRange / planeMovements.length;

            return (
              <div
                key={`summary-${plane}`}
                className="bg-white p-3 rounded-lg border border-gray-200"
              >
                <h4
                  className={`text-sm font-medium ${getPlaneColor(plane)} inline-block px-2 py-0.5 rounded-full mb-2`}
                >
                  {plane.replace(/_/g, ' ')}
                </h4>
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Movements:</span>
                    <span className="font-medium">{planeMovements.length}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-500">Avg Range:</span>
                    <span className="font-medium">{Math.round(avgRange)}°</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MovementVisualization;
